import { Except, NoResponse, Ok } from './fetchers/resultFetch'
import { Option } from '@mobily/ts-belt'

export type XXX = Option<''>
/**
 * Types
 */

type PromiseWithError<V = unknown, E = never> = Promise<V> & { __error?: E }

export type Resource = string | string[]

export type WithKey<V> = V & { key: string }

export type Fetch<V = unknown, E = unknown> = (
  resource: Resource,
  options?: FetchOptions
) => PromiseWithError<V, E>

export type PreparedFetch<V = unknown, E = unknown, A = unknown> = (
  args: A,
  options?: FetchOptions
) => PromiseWithError<V, E>

export type FetchResult<V = unknown, E = unknown> = Ok<V> | Except<E> | NoResponse

export type ResultFetch = <V = unknown, E = unknown>(
  resource: Resource,
  options?: FetchOptions
) => Promise<FetchResult<V, E>>

export type ResultFetchWithKey = <V = unknown, E = unknown>(
  resource: Resource,
  options?: FetchOptions
) => WithKey<Promise<FetchResult<V, E>>>

export type InferFetchResult<F extends Fetch> = F extends Fetch<infer F> ? F : never

export type InferFetchValue<F> = F extends (...args: any) => Promise<FetchResult<infer V, any>>
  ? V
  : never

export type InferFetchError<F> = F extends (...args: any) => Promise<FetchResult<any, infer E>>
  ? E
  : never

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

export type Declare<F extends Fetch> = <V = unknown, E = unknown, A = void>(
  resource: Resource,
  options?: FetchOptions | ((args: A) => FetchOptions)
) => InferFetchResult<F> extends FetchResult
  ? Declaration<FetchResult<V, E>, never, A>
  : Declaration<V, null | E, A>

export type Declaration<Result, E = never, A = void> = {
  fetch: PreparedFetch<Result, E, A>
  key: string
}

export type Infer<F> = F extends { fetch: (...args: any) => Promise<FetchResult<infer V, any>> }
  ? V
  : InferFetchValue<F>

export type InferDeclaration<F> = F extends {
  fetch: (args: infer A, ...rest: any) => Promise<FetchResult<infer V, infer E>>
}
  ? {
      Data: V | E
      Value: V
      Except: E
      Args: A
    }
  : never

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
  form?: FormData | FormDataEntries
  files?: FormDataEntries
  params?: Record<string, any>
  parse?: (str: string) => object
  stringify?: (data: object) => string
  unwrap?: boolean
  timeout?: number
  warn?: boolean
  key?: string
}

export type FormDataEntries = Record<string, null | undefined | string | Blob | File>

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
