// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ChatSessionService } from './chat-sessions.class'
import { Repository } from '../repositories/repositories.schema'

// Main data model schema
export const chatSessionSchema = Type.Object(
  {
    // UUID string for id
    id: Type.String({ format: 'uuid' }),

    // String for title
    title: Type.String(),

    // UUID string for repositoryId, as a foreign key to a repositories table
    repositoryId: Type.String({ format: 'uuid' }),
    // UUID string for userId, assuming it's a foreign key to a users table
    userId: Type.String({ format: 'uuid' }),

    // Timestamps as strings, you might adjust the format as needed
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ChatSession', additionalProperties: false }
)
export type ChatSession = Static<typeof chatSessionSchema> & {
  repository?: Repository
}
export const chatSessionValidator = getValidator(chatSessionSchema, dataValidator)
export const chatSessionResolver = resolve<ChatSession, HookContext<ChatSessionService>>({})

export const chatSessionExternalResolver = resolve<ChatSession, HookContext<ChatSessionService>>({})

// Schema for creating new entries
export const chatSessionDataSchema = Type.Pick(chatSessionSchema, ['repositoryId', 'userId', 'title'], {
  $id: 'ChatSessionData'
})
export type ChatSessionData = Static<typeof chatSessionDataSchema>
export const chatSessionDataValidator = getValidator(chatSessionDataSchema, dataValidator)
export const chatSessionDataResolver = resolve<ChatSession, HookContext<ChatSessionService>>({})

// Schema for updating existing entries
export const chatSessionPatchSchema = Type.Pick(chatSessionSchema, ['repositoryId', 'title', 'userId'], {
  $id: 'ChatSessionPatch'
})
export type ChatSessionPatch = Static<typeof chatSessionPatchSchema>
export const chatSessionPatchValidator = getValidator(chatSessionPatchSchema, dataValidator)
export const chatSessionPatchResolver = resolve<ChatSession, HookContext<ChatSessionService>>({})

// Schema for allowed query properties
export const chatSessionQueryProperties = Type.Pick(chatSessionSchema, [
  'userId',
  'id',
  'title',
  'createdAt',
  'updatedAt'
])
export const chatSessionQuerySchema = Type.Intersect(
  [
    querySyntax(chatSessionQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ChatSessionQuery = Static<typeof chatSessionQuerySchema>
export const chatSessionQueryValidator = getValidator(chatSessionQuerySchema, queryValidator)
export const chatSessionQueryResolver = resolve<ChatSessionQuery, HookContext<ChatSessionService>>({})
