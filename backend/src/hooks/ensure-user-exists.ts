// src/hooks/ensureUserExists.ts
import { Hook, HookContext } from '@feathersjs/feathers'

export const ensureUserExists = async (context: HookContext) => {
  const { app, data } = context

  if (data.userId) {
    const usersService = app.service('users')
    const existingUser = await usersService.find({
      query: {
        id: data.userId
      },
      paginate: false
    })

    if (existingUser.length === 0) {
      await usersService.create({ id: data.userId })
    }
  }

  return context
}
