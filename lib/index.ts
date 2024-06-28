/**
 * Fetchers
 */

export { resultFetch, resultFetch as fetch, ResultErr } from './fetchers/resultFetch'
export { debugFetch } from './fetchers/debugFetch'

/**
 * Makers
 */

export { withFetch } from './makers/withFetch'
export { withOptions } from './makers/withOptions'
export { withResource, withBase } from './makers/withResource'
export { withMethods } from './makers/withMethods'
export { withDeclarations } from './makers/withDeclarations'

export { createAbortGroup } from './utils/createAbortGroup'
export { unwrap } from './utils/unwrap'
export { swr } from './utils/swr'
export type { SWRError } from './utils/swr'

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
