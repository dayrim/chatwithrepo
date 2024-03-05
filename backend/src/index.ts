// // For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
// import { feathers } from '@feathersjs/feathers'
// import express, {
//   rest,
//   json,
//   urlencoded,
//   cors,
//   serveStatic,
//   notFound,
//   errorHandler
// } from '@feathersjs/express'
// import configuration from '@feathersjs/configuration'
// import socketio from '@feathersjs/socketio'

// import type { Application } from './declarations'
// import { configurationValidator } from './configuration'
// import { logger } from './logger'
// import { logError } from './hooks/log-error'
// import { postgresql } from './postgresql'
// import { authentication } from './authentication'
// import { services } from './services/index'
// import { channels } from './channels'
// import next from 'next'
// import { IncomingMessage, ServerResponse } from 'http'
// import path from 'path'
// import dotenv from 'dotenv'

// dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// const dev = process.env.APP_ENV !== 'production'
// const nextApp = next({ dev, dir: '../web' })
// const handle = nextApp.getRequestHandler()

// const app: Application = express(feathers())

// app.use((req: IncomingMessage, res: ServerResponse<IncomingMessage>) => handle(req, res))

// app.configure(configuration(configurationValidator))
// app.use(cors())
// app.use(json())
// app.use(urlencoded({ extended: true }))
// app.configure(rest())
// app.configure(
//   socketio({
//     cors: {
//       origin: app.get('origins')
//     }
//   })
// )
// app.configure(postgresql)
// app.configure(authentication)
// app.configure(services)
// app.configure(channels)

// app.use(notFound())
// app.use(errorHandler({ logger }))

// app.service('messages').on('created', () => console.log('Created'))

// app.service('messages').on('patched', () => console.log('Patched'))
// // // Register hooks that run on all service methods
// // app.hooks({
// //   around: {
// //     all: [logError]
// //   },
// //   before: {},
// //   after: {},
// //   error: {}
// // })
// // // Register application setup and teardown hooks here
// // app.hooks({
// //   setup: [],
// //   teardown: []
// // })

// const port = app.get('port')
// const host = app.get('host')
// nextApp
//   .prepare()
//   .then(() => {
//     process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason))

//     app.listen(port).then(() => {
//       logger.info(`Feathers app listening on http://${host}:${port}`)
//     })
//   })
//   .catch((ex: { stack: any }) => {
//     console.error(ex.stack)
//     process.exit(1)
//   })

// export { app }

import { app } from './app'
import { logger } from './logger'

const port = app.get('port')
const host = app.get('host')

process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason))

app.listen(port).then(() => {
  logger.info(`Feathers app listening on http://${host}:${port}`)
})
export { app }
