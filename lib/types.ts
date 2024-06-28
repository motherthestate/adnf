import { Err, Success } from './result'

/**
 * Types
 */

export type Fetch<V = unknown> = (resource: string, options?: FetchOptions) => Promise<V>

export type FetchSuccess<V = unknown> = Success<V> & {
  aborted: false
  timeout: false
  response: Response
}
export type FetchErr = Err<null> & { aborted: boolean; timeout: boolean; response: undefined }
export type FetchErrResponse<ErrType = unknown> = Err<ErrType | null> & {
  aborted: false
  timeout: false
  response: Response
}

export type FetchResult<V = unknown, E = unknown> = FetchSuccess<V> | FetchErrResponse<E> | FetchErr

export type ResultFetch = <V = unknown, E = unknown>(
  resource: string,
  options?: FetchOptions
) => Promise<FetchResult<V, E>>

export type InferResult<F extends Fetch> = F extends Fetch<infer F> ? F : never

export type Dependent<F extends Fetch> = F & {
  _create: (create: DependFetch) => Dependent<F>
  _composedFetch: DependFetch
  _initFetch: Fetch
}

export type DependFetch = (fetch: Fetch) => Fetch

/**
 * Fetch declarations
 */

export type DeclareFetch = <F extends Fetch>(fetch: F) => Declared<F>

export type Declared<F extends Fetch> = <V = unknown, E = unknown>(
  resource: string,
  options?: FetchOptions
) => Declaration<InferResult<F> extends FetchResult ? Fetch<FetchResult<V, E>> : Fetch<V>>

export type Declaration<F extends Fetch = Fetch> = {
  fetch: () => ReturnType<F>
  key: string
}

export type FetchResultDeclaration<V, E> = Declaration<Fetch<FetchResult<V, E>>>

export type FetchDeclaration<V, E> = Declaration<Fetch<V>>

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
