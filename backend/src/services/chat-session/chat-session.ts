// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  chatSessionDataValidator,
  chatSessionPatchValidator,
  chatSessionQueryValidator,
  chatSessionResolver,
  chatSessionExternalResolver,
  chatSessionDataResolver,
  chatSessionPatchResolver,
  chatSessionQueryResolver
} from './chat-session.schema'

import type { Application } from '../../declarations'
import { ChatSessionService, getOptions } from './chat-session.class'
import { chatSessionPath, chatSessionMethods } from './chat-session.shared'

export * from './chat-session.class'
export * from './chat-session.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const chatSession = (app: Application) => {
  // Register our service on the Feathers application
  app.use(chatSessionPath, new ChatSessionService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: chatSessionMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(chatSessionPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(chatSessionExternalResolver),
        schemaHooks.resolveResult(chatSessionResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(chatSessionQueryValidator),
        schemaHooks.resolveQuery(chatSessionQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(chatSessionDataValidator),
        schemaHooks.resolveData(chatSessionDataResolver)
      ],
      patch: [
        schemaHooks.validateData(chatSessionPatchValidator),
        schemaHooks.resolveData(chatSessionPatchResolver)
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
    [chatSessionPath]: ChatSessionService
  }
}
