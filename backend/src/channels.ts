// channels.ts
import type { RealTimeConnection, Params } from '@feathersjs/feathers'
import type { AuthenticationResult } from '@feathersjs/authentication'
import '@feathersjs/transport-commons'
import type { Application, HookContext } from './declarations'
import { logger } from './logger'

export const channels = (app: Application) => {
  app.on('connection', (connection: RealTimeConnection) => {
    logger.info('New connection', { connection })

    if (connection.headers && connection.headers['userid']) {
      const userId = connection.headers['userid']
      logger.info('Extracted userId from headers', { userId })

      if (userId) {
        const userChannel = `user/${userId}`
        logger.info(`Joining user channel: ${userChannel}`)
        app.channel(userChannel).join(connection)
      }
    }
  })

  app.on('disconnect', (connection) => {
    logger.info('Connection disconnected', { connection })
    // Remove the connection from all channels it joined
    app.channels.forEach((channel) => {
      app.channel(channel).leave(connection)
    })
  })

  app.on('login', (authResult: AuthenticationResult, { connection }: Params) => {
    logger.info('User login', { authResult, connection })
    // connection can be undefined if there is no real-time connection, e.g., when logging in via REST
    if (connection) {
      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection)
    }
  })

  app.publish((data: any, context: HookContext) => {
    logger.info('Publishing event', { method: context.method, path: context.path, data })
    if (context.path === 'chatSessions' || context.path === 'messages') {
      if (!!data?.userId) {
        logger.info('Sending to user channel', { userId: data.userId })
        return app.channel(`user/${data.userId}`)
      }
    }

    // For all other events, publish only to the 'authenticated' channel
    return app.channel('authenticated')
  })
}
