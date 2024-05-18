// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { RepositoriesService } from './repositories.class'

// Main data model schema
export const repositoriesSchema = Type.Object(
  {
    id: Type.String(), // Assuming UUIDs are used for ids
    domain: Type.String(),
    provider: Type.String(),
    repoName: Type.String(),
    // Uncomment if you have a userId field linked to repositories
    userId: Type.String(),
    createdAt: Type.Optional(Type.String({ format: 'date-time' })), // Optional to reflect nullable, using a string with date-time format
    updatedAt: Type.Optional(Type.String({ format: 'date-time' })) // Optional to reflect nullable, using a string with date-time format
  },
  { $id: 'Repositories', additionalProperties: false }
)
export type Repository = Static<typeof repositoriesSchema>
export const repositoriesValidator = getValidator(repositoriesSchema, dataValidator)
export const repositoriesResolver = resolve<Repository, HookContext<RepositoriesService>>({})

export const repositoriesExternalResolver = resolve<Repository, HookContext<RepositoriesService>>({})

// Schema for creating new entries
export const repositoriesDataSchema = Type.Pick(
  repositoriesSchema,
  ['domain', 'provider', 'repoName', 'userId'],
  {
    $id: 'RepositoriesData'
  }
)
export type RepositoriesData = Static<typeof repositoriesDataSchema>
export const repositoriesDataValidator = getValidator(repositoriesDataSchema, dataValidator)
export const repositoriesDataResolver = resolve<Repository, HookContext<RepositoriesService>>({})

// Schema for updating existing entries
export const repositoriesPatchSchema = Type.Partial(repositoriesSchema, {
  $id: 'RepositoriesPatch'
})
export type RepositoriesPatch = Static<typeof repositoriesPatchSchema>
export const repositoriesPatchValidator = getValidator(repositoriesPatchSchema, dataValidator)
export const repositoriesPatchResolver = resolve<Repository, HookContext<RepositoriesService>>({})

// Schema for allowed query properties
export const repositoriesQueryProperties = Type.Pick(repositoriesSchema, [
  'domain',
  'provider',
  'repoName',
  'userId'
])
export const repositoriesQuerySchema = Type.Intersect(
  [
    querySyntax(repositoriesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type RepositoriesQuery = Static<typeof repositoriesQuerySchema>
export const repositoriesQueryValidator = getValidator(repositoriesQuerySchema, queryValidator)
export const repositoriesQueryResolver = resolve<RepositoriesQuery, HookContext<RepositoriesService>>({})
