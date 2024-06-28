import { FetchOptions, ResultFetch } from '../types'

/**
 * unwrap:
 * modifies fetch signature
 */

export const unwrap = (fetch: ResultFetch) => {
  return <V = unknown, E = unknown>(resource: string, options?: FetchOptions) => {
    return fetch<V, E>(resource, options).then(result => result.unwrap())
  }
}
