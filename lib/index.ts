/**
 * Fetchers
 */

export { resultFetch, resultFetch as fetch, ResultErr } from './fetchers/resultFetch'
export { debugFetch } from './fetchers/debugFetch'
export { voidFetch } from './fetchers/voidFetch'

/**
 * Makers
 */

export { withFetch } from './makers/withFetch'
export { withOptions } from './makers/withOptions'
export { withResource, withBase } from './makers/withResource'
export { withMethods } from './makers/withMethods'
export { withDeclarations } from './makers/withDeclarations'

export { createAbortGroup } from './helpers/createAbortGroup'
export { unwrap } from './helpers/unwrap'
export { swrResult } from './helpers/swr'
export { mergeOptions, respectParams } from './helpers/utils'
export type { SWRError } from './helpers/swr'

/**
 * Types
 */

export { Result } from './result'

export type {
  Fetch,
  FetchOptions,
  FetchErr,
  FetchErrResponse,
  FetchResult,
  FetchSuccess,
  FetchResultDeclaration,
  FetchDeclaration,
} from './types'
