import stableHash from 'stable-hash'
import { DeclareFetch, FetchOptions } from '../types'
import { isMutateMethod, mergeOptions } from '../utils/utils'

/**
 * withDeclarations
 */

export const withDeclarations: DeclareFetch = fetch => {
  return (resource, options) => {
    const passingArgs = typeof options === 'function'
    const key = hashFetch(resource, typeof options === 'function' ? {} : options)

    const prepFetch = (args: any, prepOptions?: FetchOptions) => {
      const opts = typeof options === 'function' ? options(args) : options
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
