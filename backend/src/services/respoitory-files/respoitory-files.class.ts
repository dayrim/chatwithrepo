// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type {
  RespoitoryFile,
  RespoitoryFilesData,
  RespoitoryFilesPatch,
  RespoitoryFilesQuery
} from './respoitory-files.schema'

export type { RespoitoryFile, RespoitoryFilesData, RespoitoryFilesPatch, RespoitoryFilesQuery }

export interface RespoitoryFilesParams extends KnexAdapterParams<RespoitoryFilesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class RespoitoryFilesService<ServiceParams extends Params = RespoitoryFilesParams> extends KnexService<
  RespoitoryFile,
  RespoitoryFilesData,
  RespoitoryFilesParams,
  RespoitoryFilesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'respoitoryFiles'
  }
}
