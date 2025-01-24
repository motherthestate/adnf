// import { Except, NoResponse } from '../fetchers/resultFetch'
// import { FetchResult } from '../types'

// /**
//  * swr:
//  * Transform FetchResult to compat SWR result
//  */

// export const swrResult = <V, E>(result: FetchResult<V, E>) => {
//   if (result.failed) throw SWRError(result)
//   return result.value
// }

// export const SWRError = <E>(error: NoResponse | Except<E>): SWRError<E> => {
//   return Object.assign(error.error, {
//     result: error,
//     except: error.except,
//     status: error.response?.status ?? null,
//   })
// }

// export const isSWRError = <E>(error: Error): error is SWRError<E> => {
//   return isError(error) && 'except' in error
// }

// export type SWRError<E> = Error & {
//   result: NoResponse | Except<E>
//   except: null | E
//   status: null | number
// }

// export const isError = (v: any): v is Error => v instanceof Error
