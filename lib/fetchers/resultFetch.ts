import { Result } from '../result'
import { FetchErr, FetchErrResponse, FetchOptions, FetchSuccess, ResultFetch } from '../types'
import { followSignal, isFormData, toFormData } from '../utils/utils'

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

    // merge params
    const searchParams = new URLSearchParams({
      ...Object.fromEntries(new URL(resource).searchParams),
      ...Object.fromEntries(new URLSearchParams(params ?? {})),
    })

    const fetchResource = params ? `${resource}?${searchParams.toString()}` : resource

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
        return makeResultErrResponse(
          response,
          null,
          'Fetch response not json in: fetch(..., { strict: true })'
        )
      }

      /**
       * Parse response data
       */

      const resultText = await response.text()
      const resultData = contentTypeSupportsJSON ? parse(resultText) : resultText

      if (responseOk) {
        return makeResultSuccess(response, resultData)
      }

      const errorType = resultData

      if (strict && !errorType) {
        return makeResultErrResponse(
          response,
          null,
          'Fetch response error nullable in: fetch(..., { strict: true })'
        )
      }

      return makeResultErrResponse(response, errorType)
    } catch (err) {
      // No fetch response error
      const abortDueToTimeout =
        abortController.signal.aborted && abortController.signal.reason === TimeoutReason

      return makeResultErr(err as string, {
        aborted: abortController.signal.aborted,
        timeout: abortDueToTimeout,
      })
    }
  } catch (err) {
    return makeResultErr(err as string, {
      aborted: false,
      timeout: false,
    })
  }
}

const makeResultSuccess = <V = unknown>(response: Response, value: V): FetchSuccess<V> => {
  return Object.assign(Result(value), {
    aborted: false,
    timeout: false,
    response,
  } as const)
}

const makeResultErrResponse = <E = unknown>(
  response: Response,
  type: E,
  message?: string,
  props: Partial<FetchErrResponse> = {}
): FetchErrResponse<E> => {
  return Object.assign(Result.Err(type, message), {
    aborted: false,
    timeout: false,
    ...props,
    response,
  } as const)
}

const makeResultErr = (message: string, props: Partial<FetchErr> = {}): FetchErr => {
  return Object.assign(Result.Err(null, message), {
    aborted: false,
    timeout: false,
    ...props,
    response: undefined,
  })
}

/**
 * Constants
 */

const TimeoutReason = Symbol('Timeout')
type TimeoutReason = typeof TimeoutReason
