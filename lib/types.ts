import { Err, Success } from './result'

/**
 * Types
 */

type PromiseWithError<V = unknown, E = never> = Promise<V> & { __error?: E }
type PromiseError<P extends PromiseWithError> = P extends { __error?: infer E } ? E : never

export type Resource = string | string[]

export type Fetch<V = unknown, E = unknown> = (
  resource: Resource,
  options?: FetchOptions
) => PromiseWithError<V, E>

export type PreparedFetch<V = unknown, E = unknown, A = unknown> = (
  args: A,
  options?: FetchOptions
) => PromiseWithError<V, E>

export type FetchSuccess<V = unknown> = Success<V> & {
  aborted: false
  timeout: false
  response: Response
  resolved: true
}

export type FetchErr = Err<null> & {
  aborted: boolean
  timeout: boolean
  response: undefined
  resolved: false
}

export type FetchErrResponse<ErrType = unknown> = Err<ErrType | null> & {
  aborted: false
  timeout: false
  response: Response
  resolved: true
}

export type FetchResult<V = unknown, E = unknown> = FetchSuccess<V> | FetchErrResponse<E> | FetchErr

export type ResultFetch = <V = unknown, E = unknown>(
  resource: Resource,
  options?: FetchOptions
) => Promise<FetchResult<V, E>>

export type InferResult<F extends Fetch> = F extends Fetch<infer F> ? F : never

export type Dependent<F extends ResultFetch> = F & {
  _create: (create: DependResultFetch) => Dependent<F>
  _composedFetch: DependResultFetch
  _initFetch: ResultFetch
}

export type DependResultFetch = (fetch: ResultFetch) => ResultFetch

/**
 * Fetch declarations
 */

export type DeclareFetch = <F extends ResultFetch>(fetch: F) => Declare<F>

type Declare<F extends Fetch> = <V = unknown, E = unknown, A = void>(
  resource: Resource,
  options?: FetchOptions | ((args: A) => FetchOptions)
) => InferResult<F> extends FetchResult
  ? Declaration<FetchResult<V, E>, never, A>
  : Declaration<V, null | E, A>

type Declaration<Result, E = never, A = void> = {
  fetch: PreparedFetch<Result, E, A>
  key: string
}

export type FetchResultDeclaration<V, E, A = void> = Declaration<FetchResult<V, E>, never, A>
export type FetchDeclaration<V, E, A = void> = Declaration<V, E, A>

export type FetchOptions = RequestInit & {
  // strictly json
  strict?: boolean
  fetchSymbol?: symbol
  fetch?: typeof window.fetch
  label?: string
  group?: AbortControllerGroup
  abortPrevious?: boolean
  data?: object
  form?: FormData | FormDataRecord
  files?: FormDataRecord
  params?: Record<string, any>
  parse?: (str: string) => object
  stringify?: (data: object) => string
  unwrap?: boolean
  timeout?: number
  warn?: boolean
  key?: string
}

export type FormDataRecord = Record<string, string | Blob>

export type AbortControllerGroup = {
  controllers: Set<AbortController>
  cancel: () => void
  add: () => AbortController
}

export type Methods<F extends Fetch> = F & {
  get: F
  method: (method: string) => F
  head: F
  post: F
  put: F
  delete: F
  del: F
  patch: F
}
