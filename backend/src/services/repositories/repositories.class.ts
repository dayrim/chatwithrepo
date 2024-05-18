// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type {
  Repository,
  RepositoriesData,
  RepositoriesPatch,
  RepositoriesQuery
} from './repositories.schema'

export type { Repository, RepositoriesData, RepositoriesPatch, RepositoriesQuery }

export interface RepositoriesParams extends KnexAdapterParams<RepositoriesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class RepositoriesService<ServiceParams extends Params = RepositoriesParams> extends KnexService<
Repository,
  RepositoriesData,
  RepositoriesParams,
  RepositoriesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'repositories'
  }
}
