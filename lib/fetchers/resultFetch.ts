import { Result, isError } from '../helpers/result'
import { FetchOptions, ResultFetch, ResultFetchWithKey } from '../types'
import {
  flattenResource,
  followSignal,
  isFormData,
  params as respectParams,
  entriesToFormData,
} from '../helpers/utils'
import { Ok as ResultOk, Except as ResultExcept } from '../helpers/result'

/**
 * ResultFetch
 */

export const resultFetch: ResultFetchWithKey = (resource, options) => {
  return Object.assign(resultFetchPromise(resource, options), { key: resource }) as any
}

const resultFetchPromise: ResultFetch = async (resource, options) => {
  const {
    strict = true,
    fetchSymbol = Symbol(),
    fetch = window.fetch,
    abortPrevious = false,
    group,
    label,
    parse = JSON.parse,
    stringify = JSON.stringify,
    // data
    data,
    form,
    params,
    files,
    timeout,
    unwrap,
    ...fetchOptions
  } = options ?? ({} as FetchOptions)

  resource = flattenResource(resource)

  try {
    /**
     * Extend headers
     */

    const setHeaders = (headers: Record<string, string>) => {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        ...headers,
      }
    }

    if (label) {
      setHeaders({
        'X-Request-Label': label,
      })
    }

    // define primary abort controller
    const abortController = new AbortController()

    /**
     * Request grouping
     */

    if (abortPrevious) {
      if (!group) {
        throw new Error(
          'Fetch configured with abortPrevious but has no abort group: fetch(..., { abortPrevious: true, group? })'
        )
      }

      group.cancel()
    }

    // follow existing signal
    if (fetchOptions.signal) {
      followSignal(fetchOptions.signal, abortController)
    }

    // make abortController primary fetch signal
    fetchOptions.signal = abortController.signal

    if (group) {
      const groupController = group.add()
      followSignal(groupController.signal, abortController)
    }

    const timeoutRef =
      typeof timeout === 'number'
        ? setTimeout(() => abortController.abort(TimeoutReason), timeout)
        : null

    /**
     * Data
     */

    if (data) {
      fetchOptions.body = stringify(data)
      setHeaders({
        'Content-Type': 'application/json',
      })
    }

    /**
     * Form
     */

    if (form || files) {
      if (fetchOptions.body) {
        throw new Error('Fetch provided multiple values for body. Pick data, files or form.')
      }

      if (form) fetchOptions.body = isFormData(form) ? form : entriesToFormData(form)
      if (files) fetchOptions.body = entriesToFormData(files)

      // setHeaders({
      //   'Content-Type': 'multipart/form-data',
      // })
    }

    /**
     * Search params
     */

    const fetchResource = respectParams(resource, params ?? {})

    /**
     * Fetch
     */

    try {
      const response = await fetch(fetchResource, fetchOptions)
      const responseOk = response.ok

      // clear abort timeout
      if (timeoutRef) clearTimeout(timeoutRef)

      /**
       * Verify response headers
       */

      const contentType = response.headers.get('content-type')
      const contentTypeSupportsJSON = contentType?.includes('application/json')
      const expectStrictContent = response.status === 200

      if (strict && expectStrictContent && !contentTypeSupportsJSON) {
        return Except({
          response,
          except: null,
          error: new Error('Fetch response not json in: fetch(..., { strict: true })'),
        })
      }

      /**
       * Parse response data
       */

      const resultData = contentTypeSupportsJSON ? parse(await response.text()) : null

      if (responseOk) {
        return Ok({
          value: resultData,
          response,
        })
      }

      const except = resultData

      if (strict && !except) {
        return Except({
          response,
          except: null,
          error: new Error('Fetch response error nullable in: fetch(..., { strict: true })'),
        })
      }

      return Except({
        response,
        except: except,
        error: new Error('Fetch response Except'),
      })
    } catch (error) {
      // No fetch response error
      const abortDueToTimeout =
        abortController.signal.aborted && abortController.signal.reason === TimeoutReason

      return NoResponse({
        error,
        aborted: abortController.signal.aborted,
        timeout: abortDueToTimeout,
      })
    }
  } catch (error) {
    return NoResponse({
      error,
      aborted: false,
      timeout: false,
    })
  }
}

/**
 * Results
 */

export const Ok = <V = unknown>(initial: { response: Response; value: V }): Ok<V> => {
  return Object.assign(Result.Ok(initial.value), {
    aborted: false,
    timeout: false,
    resolved: true,
    response: initial.response,
  } as const)
}

export const Except = <E = unknown>(initial: {
  response: Response
  except: E
  error: Error
}): Except<E> => {
  return Object.assign(Result.Except(initial.except, initial.error), {
    aborted: false,
    timeout: false,
    resolved: true,
    response: initial.response,
  } as const)
}

export const NoResponse = (
  initial: { error?: unknown; aborted?: boolean; timeout?: boolean } = {}
): NoResponse => {
  const error = isError(initial.error)
    ? initial.error
    : new Error('NoResponse: Provided error is on instance of Error()')

  return Object.assign(Result.Except(null, error), {
    aborted: initial.aborted ?? false,
    timeout: initial.timeout ?? false,
    resolved: false,
    response: undefined,
  } as const)
}

/**
 * Result types
 */

export type Ok<V = unknown> = ResultOk<V> & {
  aborted: false
  timeout: false
  response: Response
  resolved: true
}

export type Except<ErrType = unknown> = ResultExcept<ErrType | null> & {
  aborted: false
  timeout: false
  response: Response
  resolved: true
}

export type NoResponse = ResultExcept<null> & {
  aborted: boolean
  timeout: boolean
  response: undefined
  resolved: false
}

/**
 * Constants
 */

const TimeoutReason = Symbol('Timeout')
type TimeoutReason = typeof TimeoutReason
