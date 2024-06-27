import { DependFetch, Dependent, Fetch } from '../types'

/**
 * withFetch
 */

export const withFetch = <F extends Fetch>(prevFetch: F | Dependent<F>, depend?: DependFetch) => {
  const initFetch = 'initFetch' in prevFetch ? prevFetch.initFetch : prevFetch
  const prevComposed =
    'composedFetch' in prevFetch ? prevFetch.composedFetch : (fetch: Fetch) => fetch

  const composedFetch = (fetch: Fetch) => {
    if (depend) return prevComposed(depend(fetch))
    return prevComposed(fetch)
  }

  const fetch: Fetch = (path, opts) => {
    const cappingFetch: Fetch = (resource, options) =>
      initFetch(resource + path, { ...options, ...opts })
    return composedFetch(cappingFetch)('', {})
  }

  const create = (create: DependFetch) => {
    return withFetch(fetch, create)
  }

  return Object.assign(fetch, {
    initFetch,
    composedFetch,
    create,
  }) as Fetch<F>
}
