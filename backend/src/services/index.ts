import { respoitoryFiles } from './respoitory-files/respoitory-files'
import { repositories } from './repositories/repositories'
import { chatSession } from './chat-sessions/chat-sessions'
import { messages } from './messages/messages'
import { user } from './users/users'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(respoitoryFiles)
  app.configure(repositories)
  app.configure(chatSession)
  app.configure(messages)
  app.configure(user)
  // All services will be registered here
}
