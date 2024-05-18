// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { RespoitoryFilesService } from './respoitory-files.class'

// Main data model schema
export const respoitoryFilesSchema = Type.Object(
  {
    id: Type.String(), // Assuming UUIDs are used for ids
    googleFileName: Type.String(),
    filePath: Type.String(),
    googleFileUrl: Type.Optional(Type.String()),
    sha256Hash: Type.Optional(Type.String()),
    repositoryId: Type.String(), // Assuming UUIDs are used for ids
    expirationTime: Type.String({ format: 'date-time' }),
    createdAt: Type.Optional(Type.String({ format: 'date-time' })), // Optional to reflect nullable, using a string with date-time format
    updatedAt: Type.Optional(Type.String({ format: 'date-time' })) // Optional to reflect nullable, using a string with date-time format
  },
  { $id: 'RespoitoryFiles', additionalProperties: false }
)
const additionalQueryProperties = Type.Object({
  $limit: Type.Optional(Type.Number())
})
export type RespoitoryFile = Static<typeof respoitoryFilesSchema>
export const respoitoryFilesValidator = getValidator(respoitoryFilesSchema, dataValidator)
export const respoitoryFilesResolver = resolve<RespoitoryFile, HookContext<RespoitoryFilesService>>({})

export const respoitoryFilesExternalResolver = resolve<RespoitoryFile, HookContext<RespoitoryFilesService>>(
  {}
)

// Schema for creating new entries
export const respoitoryFilesDataSchema = Type.Pick(
  respoitoryFilesSchema,
  ['googleFileName', 'filePath', 'sha256Hash', 'repositoryId', 'googleFileUrl', 'expirationTime'],
  {
    $id: 'RespoitoryFilesData'
  }
)
export type RespoitoryFilesData = Static<typeof respoitoryFilesDataSchema>
export const respoitoryFilesDataValidator = getValidator(respoitoryFilesDataSchema, dataValidator)
export const respoitoryFilesDataResolver = resolve<RespoitoryFile, HookContext<RespoitoryFilesService>>({})

// Schema for updating existing entries
export const respoitoryFilesPatchSchema = Type.Partial(respoitoryFilesSchema, {
  $id: 'RespoitoryFilesPatch'
})
export type RespoitoryFilesPatch = Static<typeof respoitoryFilesPatchSchema>
export const respoitoryFilesPatchValidator = getValidator(respoitoryFilesPatchSchema, dataValidator)
export const respoitoryFilesPatchResolver = resolve<RespoitoryFile, HookContext<RespoitoryFilesService>>({})

// Schema for allowed query properties
export const respoitoryFilesQueryProperties = Type.Pick(respoitoryFilesSchema, [
  'googleFileName',
  'filePath',
  'sha256Hash',
  'repositoryId',
  'googleFileUrl',
  'expirationTime'
])
export const respoitoryFilesQuerySchema = Type.Intersect(
  [
    querySyntax(respoitoryFilesQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        $limit: Type.Optional(Type.Number())
      },
      { additionalProperties: true }
    )
  ],
  { additionalProperties: true }
)
export type RespoitoryFilesQuery = Static<typeof respoitoryFilesQuerySchema>
export const respoitoryFilesQueryValidator = getValidator(respoitoryFilesQuerySchema, queryValidator)
export const respoitoryFilesQueryResolver = resolve<
  RespoitoryFilesQuery,
  HookContext<RespoitoryFilesService>
>({})
