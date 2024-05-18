import { HookContext } from '@feathersjs/feathers'

// A hook that adds a join operation to include repository information
export const includeRepositoryInfo = async (context: HookContext) => {
  const { params } = context
  // Extend the query to include a join operation
  const extendedQuery = (query: any) => {
    return query
      .join('repositories', 'chatSessions.repositoryId', '=', 'repositories.id')
      .select(
        'chatSessions.*',
        'repositories.domain as repoDomain',
        'repositories.provider as repoProvider',
        'repositories.path as repoPath'
      )
    // Adjust the selection as needed
  }

  // Attach the extended query to params.knex to influence the find query
  params.knex = extendedQuery

  return context
}
