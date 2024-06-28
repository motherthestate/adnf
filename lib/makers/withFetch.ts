import { DependFetch, Dependent, Fetch } from '../types'

/**
 * withFetch
 */

export const withFetch = <F extends Fetch>(prevFetch: F | Dependent<F>, depend?: DependFetch) => {
  const _initFetch = '_initFetch' in prevFetch ? prevFetch._initFetch : prevFetch
  const prevComposed =
    '_composedFetch' in prevFetch ? prevFetch._composedFetch : (fetch: Fetch) => fetch

  const _composedFetch = (fetch: Fetch) => {
    if (depend) return prevComposed(depend(fetch))
    return prevComposed(fetch)
  }

  const fetch: Fetch = (path, opts) => {
    const cappingFetch: Fetch = (resource, options) =>
      _initFetch(resource + path, { ...options, ...opts })
    return _composedFetch(cappingFetch)('', {})
  }

  const _create = (create: DependFetch) => {
    return withFetch(fetch, create)
  }

  return Object.assign(fetch as F, {
    _initFetch,
    _composedFetch,
    _create,
  })
}
