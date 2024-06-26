// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import type { TransportConnection, Application } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client'

import { respoitoryFilesClient } from './services/respoitory-files/respoitory-files.shared'
export type {
  RespoitoryFile,
  RespoitoryFilesData,
  RespoitoryFilesQuery,
  RespoitoryFilesPatch
} from './services/respoitory-files/respoitory-files.shared'

import { repositoriesClient } from './services/repositories/repositories.shared'
export type {
  Repository,
  RepositoriesData,
  RepositoriesQuery,
  RepositoriesPatch
} from './services/repositories/repositories.shared'

import { chatSessionClient } from './services/chat-sessions/chat-sessions.shared'
export type {
  ChatSession,
  ChatSessionData,
  ChatSessionQuery,
  ChatSessionPatch
} from './services/chat-sessions/chat-sessions.shared'

import { messagesClient } from './services/messages/messages.shared'
export type {
  Messages,
  MessagesData,
  MessagesQuery,
  MessagesPatch
} from './services/messages/messages.shared'

import { userClient } from './services/users/users.shared'
export type { User, UserData, UserQuery, UserPatch } from './services/users/users.shared'

export interface Configuration {
  connection: TransportConnection<ServiceTypes>
}

export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>

/**
 * Returns a typed client for the backend app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = <Configuration = any>(
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {}
) => {
  const client: ClientApplication = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set('connection', connection)

  client.configure(userClient)
  client.configure(messagesClient)
  client.configure(chatSessionClient)
  client.configure(repositoriesClient)
  client.configure(respoitoryFilesClient)
  return client
}
