import { ResultErr } from '../fetchers/resultFetch'
import { flattenResource } from '../helpers/utils'
import { isError } from '../result'
import { DependResultFetch, Dependent, ResultFetch } from '../types'

/**
 * withFetch
 */

export const withFetch = <F extends ResultFetch>(
  prevFetch: F | Dependent<F>,
  depend?: DependResultFetch
) => {
  const _initFetch = '_initFetch' in prevFetch ? prevFetch._initFetch : prevFetch
  const prevComposed =
    '_composedFetch' in prevFetch ? prevFetch._composedFetch : (fetch: ResultFetch) => fetch

  const _composedFetch = (fetch: ResultFetch) => {
    if (depend) return prevComposed(depend(fetch))
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
      return ResultErr(isError(err) ? err : undefined)
    }
  }

  const _create = (create: DependResultFetch) => {
    return withFetch(fetch, create)
  }

  return Object.assign(fetch as F, {
    _initFetch,
    _composedFetch,
    _create,
  })
}
