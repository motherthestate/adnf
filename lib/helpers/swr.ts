import { FetchResult } from '../types'

/**
 * swr:
 * Transform FetchResult to compat SWR result
 */

export const swrResult = <V, E>(result: FetchResult<V, E>) => {
  if (result.failed) {
    throw SWRError(result.error, result.response?.status)
  }
  return result.value
}

const SWRError = <T>(type: T, status?: null | number): SWRError<T> => {
  return Object.assign(new Error('ADNF: SWRError'), {
    type,
    status: status ?? null,
  })
}

export type SWRError<T> = Error & {
  type: null | T
  status: null | number
}
