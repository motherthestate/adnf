import { Err, Success } from './result'

/**
 * Types
 */

export type FetchSuccess<V> = Success<V> & { aborted: false; timeout: false; response: Response }
export type FetchErr = Err<null> & { aborted: boolean; timeout: boolean; response: undefined }
export type FetchErrResponse<ErrType> = Err<ErrType | null> & {
  aborted: false
  timeout: false
  response: Response
}

export type FetchResult<V, E> = FetchSuccess<V> | FetchErrResponse<E> | FetchErr

export type Fetch<Result = any> = (resource: string, options?: FetchOptions) => Promise<Result>

export type InferResult<F extends Fetch> = F extends Fetch<infer F> ? F : never

export type Dependent<F extends Fetch> = F & {
  create: (create: DependFetch) => Dependent<F>
  composedFetch: DependFetch
  initFetch: Fetch
}

export type DependFetch = (fetch: Fetch) => Fetch

export type ResultFetch<V = unknown, E = unknown> = <FV = V, FE = E>(
  resource: string,
  options?: FetchOptions
) => Promise<FetchResult<FV, FE>>

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
