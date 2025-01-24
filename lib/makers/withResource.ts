import { flattenResource } from '../helpers/utils'
import { Resource, ResultFetch } from '../types'
import { withMiddleware } from './withMiddleware'

/**
 * withResource
 */

export const withResource = <F extends ResultFetch>(
  fetch: F,
  resource: Resource | ((resource: Resource) => string)
) => {
  return withMiddleware(fetch, fetch => (res, options) => {
    res = flattenResource(res)
    return fetch(
      typeof resource === 'function' ? resource(res) : res + flattenResource(resource),
      options
    )
  })
}

/**
 * withBase
 */

export const withBase = <F extends ResultFetch>(fetch: F, base: string) => {
  return withResource(fetch, resource => base + resource)
}
