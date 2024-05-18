// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  repositoriesDataValidator,
  repositoriesPatchValidator,
  repositoriesQueryValidator,
  repositoriesResolver,
  repositoriesExternalResolver,
  repositoriesDataResolver,
  repositoriesPatchResolver,
  repositoriesQueryResolver
} from './repositories.schema'

import type { Application } from '../../declarations'
import { RepositoriesService, getOptions } from './repositories.class'
import { repositoriesPath, repositoriesMethods } from './repositories.shared'
import { ensureUserExists } from '../../hooks/ensure-user-exists'

export * from './repositories.class'
export * from './repositories.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const repositories = (app: Application) => {
  // Register our service on the Feathers application
  app.use(repositoriesPath, new RepositoriesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: repositoriesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(repositoriesPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(repositoriesExternalResolver),
        schemaHooks.resolveResult(repositoriesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(repositoriesQueryValidator),
        schemaHooks.resolveQuery(repositoriesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(repositoriesDataValidator),
        schemaHooks.resolveData(repositoriesDataResolver),
        ensureUserExists
      ],
      patch: [
        schemaHooks.validateData(repositoriesPatchValidator),
        schemaHooks.resolveData(repositoriesPatchResolver)
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
    [repositoriesPath]: RepositoriesService
  }
}
