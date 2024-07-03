import { ResultErr } from '../fetchers/resultFetch'
import { flattenResource, mergeOptions, params } from '../helpers/utils'
import { tcResult } from '../result'
import { DeclareFetch, FetchOptions } from '../types'

/**
 * withDeclarations
 */

export const withDeclarations: DeclareFetch = fetch => {
  return (resource, options) => {
    resource = flattenResource(resource)
    const key = hashFetch(resource, typeof options === 'function' ? {} : options)

    const prepFetch = (args: any, prepOptions?: FetchOptions) => {
      const optionsResult = tcResult(() =>
        typeof options === 'function' ? options(args) : options
      )

      if (optionsResult.failed) {
        return ResultErr(optionsResult.error)
      }

      const opts = optionsResult.value
      const mergedOptions = mergeOptions(opts, { key })

      return fetch(resource, mergeOptions(mergedOptions, prepOptions))
    }

    return {
      key: key,
      fetch: prepFetch as any,
      resource,
    }
  }
}

const hashFetch = (resource: string, options?: FetchOptions): string => {
  return params(resource, options?.params ?? {})
}
