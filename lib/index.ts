/**
 * Fetchers
 */

export { resultFetch, resultFetch as fetch, NoResponse, Except, Ok } from './fetchers/resultFetch'

export { debugFetch } from './fetchers/debugFetch'
export { voidFetch } from './fetchers/voidFetch'

/**
 * Makers
 */

export { withMiddleware as withMiddleware } from './makers/withMiddleware'
export { withOptions } from './makers/withOptions'
export { withResource, withBase } from './makers/withResource'
export { withMethods } from './makers/withMethods'
export { withDeclarations } from './makers/withDeclarations'

export { createAbortGroup } from './helpers/createAbortGroup'
export { unwrap } from './helpers/unwrap'
export { mergeOptions, params, params as respectParams } from './helpers/utils'

/**
 * Types
 */

export { Result } from './helpers/result'

export type {
  Fetch,
  FetchOptions,
  FetchResult,
  FetchResultDeclaration,
  FetchDeclaration,
  InferFetchResult,
  InferFetchValue,
  InferFetchError,
  InferDeclaration,
  Infer,
  PreparedFetch,
  Declaration,
  Declare,
  XXX,
} from './types'
