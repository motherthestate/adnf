import stableHash from 'stable-hash'
import { DeclareFetch, FetchOptions } from '../types'
import { mergeOptions } from '../utils/utils'

/**
 * withDeclarations
 */

export const withDeclarations: DeclareFetch = fetch => {
  return (resource, options) => {
    const key = hashFetch(resource, options)
    const prepFetch = (opts?: FetchOptions) => {
      return fetch(resource, mergeOptions(options, { ...opts, key }))
    }

    return {
      key: key,
      fetch: prepFetch as any,
      resource,
    }
  }
}

const hashFetch = (resource: string, options?: FetchOptions): string => {
  const resourceWithParams = [resource, options?.params ?? {}]
  const key = stableHash(resourceWithParams)

  return key
}
