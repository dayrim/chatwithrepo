// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  ChatSession,
  ChatSessionData,
  ChatSessionPatch,
  ChatSessionQuery,
  ChatSessionService
} from './chat-session.class'

export type { ChatSession, ChatSessionData, ChatSessionPatch, ChatSessionQuery }

export type ChatSessionClientService = Pick<
  ChatSessionService<Params<ChatSessionQuery>>,
  (typeof chatSessionMethods)[number]
>

export const chatSessionPath = 'chat-session'

export const chatSessionMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const chatSessionClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(chatSessionPath, connection.service(chatSessionPath), {
    methods: chatSessionMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [chatSessionPath]: ChatSessionClientService
  }
}
