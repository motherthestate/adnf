import { FetchOptions, ResultFetch } from '../types'

/**
 * swr:
 * modifies fetch signature
 */

export const swr = (fetch: ResultFetch) => {
  return <V = unknown, E = unknown>(resource: string, options?: FetchOptions) => {
    return fetch<V, E>(resource, options).then(result => {
      if (result.failed) {
        throw SWRError(result.error, result.response?.status)
      }
      return result.value
    })
  }
}

const SWRError = <T>(type: T, status?: null | number): SWRError<T> => {
  return Object.assign(new Error('ADNF: SWRError'), {
    type,
    status: status ?? null,
  })
}

export type SWRError<T> = Error & {
  type: T
  status: null | number
}
