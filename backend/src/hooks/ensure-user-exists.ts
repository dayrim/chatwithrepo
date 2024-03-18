// src/hooks/ensureUserExists.ts
import { Hook, HookContext } from '@feathersjs/feathers'
import { logger } from '../logger'

export const ensureUserExists = async (context: HookContext) => {
  const { app, data } = context

  if (data.userId) {
    logger.info('Ensure user exists ... ' + data.userId)
    const usersService = app.service('users')
    const existingUser = await usersService.find({
      query: {
        id: data.userId
      },
      paginate: false
    })

    if (existingUser.length === 0) {
      logger.info('Creating new user ...')
      await usersService.create({ id: data.userId, maxTries: 3 })
      logger.info('User created !')
    }
  }

  return context
}
