import { HookContext } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'

export const checkAndDecrementMaxTries = async (context: HookContext) => {
  const { app, data } = context

  console.log(data, 'data')
  // Fetch the user to check `maxTries`
  const user = await app.service('users').get(data.userId)

  if (user.maxTries > 0) {
    if (data.role === 'model') {
      await app.service('users').patch(data.userId, {
        maxTries: user.maxTries - 1
      })
    }
  } else if (user.subscriptionStatus !== 'active') {
    console.log(user, 'user')
    // No tries left, throw error
    throw new BadRequest('No attempts left.')
  }

  return context
}
