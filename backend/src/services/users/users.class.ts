// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { User, UserData, UserPatch, UserQuery } from './users.schema'
import { BadRequest } from '@feathersjs/errors'
import { Stripe } from 'stripe'
import { logger } from '../../logger'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

export type { User, UserData, UserPatch, UserQuery }

export interface UserParams extends KnexAdapterParams<UserQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class UserService<ServiceParams extends Params = UserParams> extends KnexService<
  User,
  UserData,
  UserParams,
  UserPatch
> {
  async register({
    userId,
    email,
    password
  }: {
    userId: string
    email: string
    password: string
  }): Promise<UserData> {
    logger.debug('UserService.register called', { userId, email, password })

    // First, check if the user with the given userId exists and doesn't have an email
    const user = await this.find({
      query: {
        id: userId
      },
      paginate: false
    })
    if (user.length > 0) {
      if (!!user[0].email) throw new BadRequest('User is already registered.')

      const customer = await stripe.customers.create({ email })
      logger.debug('Stripe customer', customer)
      const updatedUser = await this.patch(userId, {
        email,
        password,
        stripeCustomerId: customer.id
      })
      logger.debug('UserService.register success', updatedUser)
      return updatedUser
    } else {
      // Throw an error if no matching user is found or if the user already has an email
      throw new BadRequest('User does not exist or is already registered.')
    }
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'users'
  }
}
