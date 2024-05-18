// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Repository,
  RepositoriesData,
  RepositoriesPatch,
  RepositoriesQuery,
  RepositoriesService
} from './repositories.class'

export type { Repository, RepositoriesData, RepositoriesPatch, RepositoriesQuery }

export type RepositoriesClientService = Pick<
  RepositoriesService<Params<RepositoriesQuery>>,
  (typeof repositoriesMethods)[number]
>

export const repositoriesPath = 'repositories'

export const repositoriesMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const repositoriesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(repositoriesPath, connection.service(repositoriesPath), {
    methods: repositoriesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [repositoriesPath]: RepositoriesClientService
  }
}
