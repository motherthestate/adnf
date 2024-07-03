import { Result, isError } from '../result'
import { FetchErr, FetchErrResponse, FetchOptions, FetchSuccess, ResultFetch } from '../types'
import { followSignal, isFormData, respectParams, toFormData } from '../helpers/utils'

/**
 * ResultFetch
 */

export const resultFetch: ResultFetch = async (resource, options) => {
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

      if (form) fetchOptions.body = isFormData(form) ? form : toFormData(form)
      if (files) fetchOptions.body = toFormData(files)

      setHeaders({
        'Content-Type': 'multipart/form-data',
      })
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

      if (strict && !contentTypeSupportsJSON) {
        return ResultErrResponse(
          response,
          null,
          new Error('Fetch response not json in: fetch(..., { strict: true })')
        )
      }

      /**
       * Parse response data
       */

      const resultText = await response.text()
      const resultData = contentTypeSupportsJSON ? parse(resultText) : resultText

      if (responseOk) {
        return ResultSuccess(response, resultData)
      }

      const errorType = resultData

      if (strict && !errorType) {
        return ResultErrResponse(
          response,
          null,
          new Error('Fetch response error nullable in: fetch(..., { strict: true })')
        )
      }

      return ResultErrResponse(response, errorType)
    } catch (err) {
      // No fetch response error
      const abortDueToTimeout =
        abortController.signal.aborted && abortController.signal.reason === TimeoutReason

      return ResultErr(isError(err) ? err : undefined, {
        aborted: abortController.signal.aborted,
        timeout: abortDueToTimeout,
      })
    }
  } catch (err) {
    return ResultErr(isError(err) ? err : undefined, {
      aborted: false,
      timeout: false,
    })
  }
}

const ResultSuccess = <V = unknown>(response: Response, value: V): FetchSuccess<V> => {
  return Object.assign(Result(value), {
    aborted: false,
    timeout: false,
    resolved: true,
    declarationError: false,
    response,
  } as const)
}

const ResultErrResponse = <E = unknown>(
  response: Response,
  type: E,
  error?: Error,
  props: Partial<FetchErrResponse> = {}
): FetchErrResponse<E> => {
  return Object.assign(Result.Err(type, error), {
    aborted: false,
    timeout: false,
    resolved: true,
    declarationError: false,
    ...props,
    response,
  } as const)
}

export const ResultErr = (error?: Error, props: Partial<FetchErr> = {}): FetchErr => {
  return Object.assign(Result.Err(null, error), {
    aborted: false,
    timeout: false,
    resolved: false,
    declarationError: false,
    ...props,
    response: undefined,
  } as const)
}

/**
 * Constants
 */

const TimeoutReason = Symbol('Timeout')
type TimeoutReason = typeof TimeoutReason
