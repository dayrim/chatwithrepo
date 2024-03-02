// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { MessagesService } from './messages.class'

// Main data model schema

export const messagesSchema = Type.Object(
  {
    id: Type.String(), // Assuming UUIDs are used for ids, so this should be a string
    text: Type.String(), // Making it optional to allow for nullable
    userId: Type.String(), // Assuming UUIDs for user IDs
    createdAt: Type.Optional(Type.String({ format: 'date-time' })), // Optional to reflect nullable, using a string with date-time format
    updatedAt: Type.Optional(Type.String({ format: 'date-time' })) // Optional to reflect nullable, using a string with date-time format
  },
  { $id: 'Messages', additionalProperties: false }
)

export type Messages = Static<typeof messagesSchema>
export const messagesValidator = getValidator(messagesSchema, dataValidator)
export const messagesResolver = resolve<Messages, HookContext<MessagesService>>({})

export const messagesExternalResolver = resolve<Messages, HookContext<MessagesService>>({})

// Schema for creating new entries
export const messagesDataSchema = Type.Pick(messagesSchema, ['userId', 'text'], {
  $id: 'MessagesData'
})

export type MessagesData = Static<typeof messagesDataSchema>
export const messagesDataValidator = getValidator(messagesDataSchema, dataValidator)
export const messagesDataResolver = resolve<Messages, HookContext<MessagesService>>({})

// Schema for updating existing entries
export const messagesPatchSchema = Type.Partial(messagesSchema, {
  $id: 'MessagesPatch'
})
export type MessagesPatch = Static<typeof messagesPatchSchema>
export const messagesPatchValidator = getValidator(messagesPatchSchema, dataValidator)
export const messagesPatchResolver = resolve<Messages, HookContext<MessagesService>>({})

// Schema for allowed query properties
export const messagesQueryProperties = Type.Pick(messagesSchema, ['id', 'text'])
export const messagesQuerySchema = Type.Intersect(
  [
    querySyntax(messagesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type MessagesQuery = Static<typeof messagesQuerySchema>
export const messagesQueryValidator = getValidator(messagesQuerySchema, queryValidator)
export const messagesQueryResolver = resolve<MessagesQuery, HookContext<MessagesService>>({})
