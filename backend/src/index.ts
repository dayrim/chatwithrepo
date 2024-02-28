// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers'
import express, {
  rest,
  json,
  urlencoded,
  cors,
  serveStatic,
  notFound,
  errorHandler
} from '@feathersjs/express'
import configuration from '@feathersjs/configuration'
import socketio from '@feathersjs/socketio'

import type { Application } from './declarations'
import { configurationValidator } from './configuration'
import { logger } from './logger'
import { logError } from './hooks/log-error'
import { postgresql } from './postgresql'
import { authentication } from './authentication'
import { services } from './services/index'
import { channels } from './channels'
import next from 'next'
import { IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import dotenv from 'dotenv'

// Load dotenv config
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// Initialize Next.js
const dev = process.env.APP_ENV !== 'production'
const nextApp = next({ dev, dir: '../web' })
const handle = nextApp.getRequestHandler()

// Prepare Next.js and integrate it into the Feathers/Express server
nextApp
  .prepare()
  .then(() => {
    const app: Application = express(feathers())
    app.use((req: IncomingMessage, res: ServerResponse<IncomingMessage>) => handle(req, res))
    // Load app configuration
    app.configure(configuration(configurationValidator))
    app.use(cors())
    app.use(json())
    app.use(urlencoded({ extended: true }))
    // Host the public folder
    // app.use('/', serveStatic(app.get('public')))

    // Configure services and real-time functionality
    app.configure(rest())
    app.configure(
      socketio({
        cors: {
          origin: app.get('origins')
        }
      })
    )
    app.configure(postgresql)
    app.configure(authentication)
    app.configure(services)
    app.configure(channels)

    // Configure a middleware for 404s and the error handler
    app.use(notFound())
    app.use(errorHandler({ logger }))

    // // Register hooks that run on all service methods
    // app.hooks({
    //   around: {
    //     all: [logError]
    //   },
    //   before: {},
    //   after: {},
    //   error: {}
    // })
    // // Register application setup and teardown hooks here
    // app.hooks({
    //   setup: [],
    //   teardown: []
    // })

    const port = app.get('port')
    const host = app.get('host')

    process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason))

    app.listen(port).then(() => {
      logger.info(`Feathers app listening on http://${host}:${port}`)
    })
  })
  .catch((ex: { stack: any }) => {
    console.error(ex.stack)
    process.exit(1)
  })
