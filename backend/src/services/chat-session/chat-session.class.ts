// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { ChatSession, ChatSessionData, ChatSessionPatch, ChatSessionQuery } from './chat-session.schema'

export type { ChatSession, ChatSessionData, ChatSessionPatch, ChatSessionQuery }

export interface ChatSessionParams extends KnexAdapterParams<ChatSessionQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ChatSessionService<ServiceParams extends Params = ChatSessionParams> extends KnexService<
  ChatSession,
  ChatSessionData,
  ChatSessionParams,
  ChatSessionPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'chat-session'
  }
}
