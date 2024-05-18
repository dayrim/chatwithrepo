// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { passwordHash } from '@feathersjs/authentication-local'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { UserService } from './users.class'

export const userSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    email: Type.Optional(Type.String()),
    password: Type.Optional(Type.String()),
    githubId: Type.Optional(Type.String()),
    geminiApiKey: Type.Optional(Type.String()),
    name: Type.Optional(Type.String()),
    maxTries: Type.Integer(),
    isAdmin: Type.Boolean(),
    stripeCustomerId: Type.Optional(Type.String()),
    subscriptionStatus: Type.Optional(
      Type.Union([
        Type.Literal('active'),
        Type.Literal('inactive'),
        Type.Literal('canceled'),
        Type.Literal('incomplete'),
        Type.Literal('incomplete_expired'),
        Type.Literal('past_due'),
        Type.Literal('paused'),
        Type.Literal('trialing'),
        Type.Literal('unpaid')
      ])
    ),
    subscriptionType: Type.Optional(Type.Union([Type.Literal('basic-plan')])),
    subscriptionExpiresAt: Type.Optional(Type.String({ format: 'date-time' })), // ISO 8601 date format
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'User', additionalProperties: false }
)

export type User = Static<typeof userSchema>

export const userValidator = getValidator(userSchema, dataValidator)
export const userResolver = resolve<User, HookContext<UserService>>({})

export const userExternalResolver = resolve<User, HookContext<UserService>>({
  // The password should never be visible externally
  password: async () => undefined
})

// Schema for creating new entries
export const userDataSchema = Type.Pick(
  userSchema,
  [
    'id',
    'email',
    'password',
    'githubId',
    'name',
    'maxTries',
    'stripeCustomerId',
    'subscriptionStatus',
    'subscriptionType',
    'subscriptionExpiresAt'
  ],
  {
    $id: 'UserData'
  }
)

export type UserData = Static<typeof userDataSchema>
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve<User, HookContext<UserService>>({
  password: passwordHash({ strategy: 'local' })
})

// Schema for updating existing entries
export const userPatchSchema = Type.Partial(userSchema, { $id: 'UserPatch' })
export type UserPatch = Static<typeof userPatchSchema>
export const userPatchValidator = getValidator(userPatchSchema, dataValidator)
export const userPatchResolver = resolve<User, HookContext<UserService>>({
  password: passwordHash({ strategy: 'local' })
})

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, ['id', 'email', 'githubId', 'stripeCustomerId'])
export const userQuerySchema = Type.Intersect(
  [querySyntax(userQueryProperties), Type.Object({}, { additionalProperties: false })],
  { additionalProperties: false }
)

export type UserQuery = Static<typeof userQuerySchema>
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve<UserQuery, HookContext<UserService>>({
  id: async (value, user, context) => {
    if (context.params.user) {
      return context.params.user.id
    }
    return value
  }
})
