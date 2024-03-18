// stripeWebhook.ts
import { Context } from 'koa'
import Stripe from 'stripe'
import { Application } from './declarations'
import { logger } from './logger' // Ensure you have the correct path to your logger module

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

export async function handleStripeWebhook(ctx: Context, app: Application) {
  const sig = ctx.request.headers['stripe-signature'] as string
  let buf: string = await parseRawBody(ctx)

  try {
    const event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET || '')

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.resumed':
      case 'customer.subscription.paused':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription
        logger.info(`Handled event type: ${event.type}`)

        logger.debug('Event object: ', subscription)
        // Example service call to update user's subscription in your FeatherJS app
        try {
          const userId = await getUserIdByStripeCustomerId(app, subscription.customer as string)
          if (!userId) {
            logger.error(`User not found for customer ID: ${subscription.customer}`)
            ctx.status = 400
            ctx.body = 'User not found.'
            return
          }

          await updateSubscriptionDetails(app, userId, subscription)
          logger.info(`Subscription details updated for user ${userId} with status ${subscription.status}`)
        } catch (error: any) {
          logger.error(`Error processing subscription event: ${error.message}`)
          ctx.status = 500
          ctx.body = 'Server Error'
          return
        }
        break

      default:
        logger.warn(`Unhandled event type: ${event.type}`)
    }

    ctx.status = 200
    ctx.body = { received: true }
  } catch (err: any) {
    logger.error(`Webhook Error: ${err.message}`)
    ctx.status = 400
    ctx.body = `Webhook Error: ${err.message}`
  }
}

async function parseRawBody(ctx: Context): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    ctx.req.on('data', (chunk: Buffer) => {
      data += chunk.toString()
    })
    ctx.req.on('end', () => {
      resolve(data)
    })
    ctx.req.on('error', (err) => {
      reject(err)
    })
  })
}

// Replace these placeholders with actual implementations
async function getUserIdByStripeCustomerId(
  app: Application,
  stripeCustomerId: string
): Promise<string | null> {
  const user = await app.service('users').find({
    query: { stripeCustomerId }
  })
  logger.debug(`User lookup for Stripe Customer ID ${stripeCustomerId}:`, user)
  if (user.data.length > 0) {
    return user.data[0].id
  } else {
    logger.error('Stripe customer id not found.')
    throw new Error('Stripe customer id not found.')
  }
}

async function updateSubscriptionDetails(
  app: Application,
  userId: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const { status, items } = subscription
  const subscriptionType = items.data[0]?.price?.lookup_key as 'basic-plan' // Assuming the first item's product corresponds to the subscription type

  const subscriptionExpiresAt = new Date(subscription.current_period_end * 1000).toISOString()
  logger.debug(
    `Updating subscription details for user ${userId} with status ${status}, type ${subscriptionType}, and expiration at ${subscriptionExpiresAt}`
  )
  await app.service('users').patch(userId, {
    subscriptionStatus: status,
    subscriptionType,
    subscriptionExpiresAt
  })
}
