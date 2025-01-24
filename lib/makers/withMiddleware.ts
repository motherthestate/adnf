import { NoResponse } from '../fetchers/resultFetch'
import { isError } from '../helpers/result'
import { flattenResource } from '../helpers/utils'
import { DependResultFetch, Dependent, ResultFetch } from '../types'

/**
 * withMiddleware
 */

export const withMiddleware = <F extends ResultFetch>(
  prevFetch: F | Dependent<F>,
  depend?: DependResultFetch
) => {
  const _initFetch = '_initFetch' in prevFetch ? prevFetch._initFetch : prevFetch
  const prevComposed =
    '_composedFetch' in prevFetch ? prevFetch._composedFetch : (fetch: ResultFetch) => fetch

  const _composedFetch = (fetch: ResultFetch) => {
    if (depend) {
      return prevComposed(depend(fetch))
    }

    return prevComposed(fetch)
  }

  const fetch: ResultFetch = async (path, opts) => {
    const cappingFetch: ResultFetch = (resource, options) => {
      resource = flattenResource(resource)
      return _initFetch(resource + path, { ...options, ...opts })
    }

    try {
      return _composedFetch(cappingFetch)('', {})
    } catch (err) {
      return NoResponse({ error: isError(err) ? err : undefined })
    }
  }

  const _with = (create: DependResultFetch) => {
    return withMiddleware(fetch, create)
  }

  return Object.assign(fetch as F, {
    _initFetch,
    _composedFetch,
    with: _with,
  })
}
