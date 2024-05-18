import { HookContext } from '@feathersjs/feathers'

export const disablePagination = async (context: HookContext) => {
  if (context.params.query.$limit === -1) {
    context.params.paginate = false
    delete context.params.query.$limit
  }
  return context
}
