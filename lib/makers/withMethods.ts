import { Fetch } from '../types'
import { withOptions } from './withOptions'

/**
 * withMethods
 */

export const withMethods = <F extends Fetch>(fetch: F) => {
  const method = (method: string) => withOptions(fetch, { method })

  return {
    method,
    get: method('get'),
    head: method('head'),
    post: method('post'),
    put: method('put'),
    delete: method('delete'),
    del: method('delete'),
    patch: method('patch'),
  }
}
