import { Fetch } from '../types'
import { withFetch } from './withFetch'

/**
 * withResource
 */

export const withResource = <F extends Fetch>(
  fetch: F,
  resource: string | ((resource: string) => string)
) => {
  return withFetch(fetch, fetch => (res, options) => {
    return fetch(typeof resource === 'function' ? resource(res) : res + resource, options)
  })
}

/**
 * withBase
 */

export const withBase = <F extends Fetch>(fetch: F, base: string) => {
  return withResource(fetch, resource => base + resource)
}