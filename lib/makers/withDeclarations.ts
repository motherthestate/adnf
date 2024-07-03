import stableHash from 'stable-hash'
import { isMutateMethod, mergeOptions } from '../helpers/utils'
import { DeclareFetch, FetchOptions } from '../types'
import { ResultErr } from '../fetchers/resultFetch'
import { tcResult } from '../result'

/**
 * withDeclarations
 */

export const withDeclarations: DeclareFetch = fetch => {
  return (resource, options) => {
    const passingArgs = typeof options === 'function'
    const key = hashFetch(resource, typeof options === 'function' ? {} : options)

    const prepFetch = (args: any, prepOptions?: FetchOptions) => {
      const optionsResult = tcResult(() =>
        typeof options === 'function' ? options(args) : options
      )

      if (optionsResult.failed) {
        return ResultErr(optionsResult.error, { declarationError: true })
      }

      const opts = optionsResult.value
      const mergedOptions = mergeOptions(opts, {
        key,
        method: passingArgs
          ? opts?.method && isMutateMethod(opts.method)
            ? opts.method
            : 'post'
          : options?.method,
      })

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
  const resourceWithParams = [resource, { params: options?.params ?? {} }]
  const key = stableHash(resourceWithParams)

  return key
}
