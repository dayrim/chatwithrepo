//  For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors, serveStatic } from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'
import { Context } from 'koa' // Ensure you have the correct type import for Context

import { configurationValidator } from './configuration'
import type { Application } from './declarations'
import { logError } from './hooks/log-error'
import { postgresql } from './postgresql'
import { authentication } from './authentication'
import { services } from './services/index'
import { channels } from './channels'
import { handleStripeWebhook } from './stripeWebhooks'

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))
app.use(async (ctx, next) => {
  if (ctx.path !== '/stripe/webhooks') {
    return bodyParser()(ctx, next)
  } else {
    return next()
  }
})

// Stripe Webhook handler
app.use(async (ctx, next) => {
  if (ctx.path === '/stripe/webhooks') {
    await handleStripeWebhook(ctx, app)
  } else {
    await next()
  }
})
// Set up Koa middleware
app.use(cors())
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())

// Configure services and transports
app.configure(rest())
app.use(
  cors({
    origin: (ctx: Context): Promise<string> => {
      const allowedOrigins = app.get('origins')
      const requestOrigin = ctx.request.header.origin

      return new Promise((resolve, reject) => {
        if (allowedOrigins && requestOrigin && allowedOrigins.includes(requestOrigin)) {
          resolve(requestOrigin)
        } else {
          reject()
        }
      })
    }
  })
)

app.configure(postgresql)
app.configure(authentication)
app.configure(services)
app.configure(channels)

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError]
  },
  before: {},
  after: {},
  error: {}
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: []
})

export { app }
