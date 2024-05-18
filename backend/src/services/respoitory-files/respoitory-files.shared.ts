// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  RespoitoryFile,
  RespoitoryFilesData,
  RespoitoryFilesPatch,
  RespoitoryFilesQuery,
  RespoitoryFilesService
} from './respoitory-files.class'

export type { RespoitoryFile, RespoitoryFilesData, RespoitoryFilesPatch, RespoitoryFilesQuery }

export type RespoitoryFilesClientService = Pick<
  RespoitoryFilesService<Params<RespoitoryFilesQuery>>,
  (typeof respoitoryFilesMethods)[number]
>

export const respoitoryFilesPath = 'repositoryFiles'

export const respoitoryFilesMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const respoitoryFilesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(respoitoryFilesPath, connection.service(respoitoryFilesPath), {
    methods: respoitoryFilesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [respoitoryFilesPath]: RespoitoryFilesClientService
  }
}
