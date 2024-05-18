// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  respoitoryFilesDataValidator,
  respoitoryFilesPatchValidator,
  respoitoryFilesQueryValidator,
  respoitoryFilesResolver,
  respoitoryFilesExternalResolver,
  respoitoryFilesDataResolver,
  respoitoryFilesPatchResolver,
  respoitoryFilesQueryResolver
} from './respoitory-files.schema'

import type { Application } from '../../declarations'
import { RespoitoryFilesService, getOptions } from './respoitory-files.class'
import { respoitoryFilesPath, respoitoryFilesMethods } from './respoitory-files.shared'
import { disablePagination } from '../../hooks/disable-pagination'

export * from './respoitory-files.class'
export * from './respoitory-files.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const respoitoryFiles = (app: Application) => {
  // Register our service on the Feathers application
  app.use(respoitoryFilesPath, new RespoitoryFilesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: respoitoryFilesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(respoitoryFilesPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(respoitoryFilesExternalResolver),
        schemaHooks.resolveResult(respoitoryFilesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(respoitoryFilesQueryValidator),
        schemaHooks.resolveQuery(respoitoryFilesQueryResolver)
      ],
      find: [disablePagination],
      get: [],
      create: [
        schemaHooks.validateData(respoitoryFilesDataValidator),
        schemaHooks.resolveData(respoitoryFilesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(respoitoryFilesPatchValidator),
        schemaHooks.resolveData(respoitoryFilesPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [respoitoryFilesPath]: RespoitoryFilesService
  }
}
