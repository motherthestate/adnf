import { FetchOptions, FormDataRecord } from '../types'

export const isFile = (value: any): value is File => 'File' in window && value instanceof File
export const isFormData = (value: unknown): value is FormData => value instanceof FormData

export const toFormData = (entries: FormDataRecord) => {
  const form = new FormData()

  Object.entries(entries).forEach(([key, value]) => {
    if (value === undefined) return
    if (value === null) return form.set(key, '')
    if (typeof value === 'string' || typeof value === 'number') return form.set(key, `${value}`)

    // single file
    if (isFile(value)) return form.set(key, value)

    // array of files
    if (Array.isArray(value) && !!value.length && value.every(v => isFile(v))) {
      return value.forEach(file => form.append(`${key}[]`, file))
    }

    if ((typeof value === 'object' && value !== null) || Array.isArray(value)) {
      try {
        const v = JSON.stringify(value)
        form.set(key, v)
      } catch {
        //
      }
      return
    }
  })

  return form
}

export const followSignal = (signal: AbortSignal, followingAbortController: AbortController) => {
  signal.addEventListener(
    'abort',
    event => {
      const abortEvent = event as { currentTarget: { reason?: string } }
      followingAbortController.abort(abortEvent.currentTarget.reason)
    },
    {
      once: true,
      signal: followingAbortController.signal,
    }
  )
}

export const mergeOptions = (
  prevOptions: FetchOptions = {},
  options: FetchOptions = {},
  warn = true
): FetchOptions => {
  if (
    warn &&
    ((prevOptions.group && options.group) ||
      (prevOptions.form && options.form) ||
      (prevOptions.files && options.files))
  ) {
    console.warn(
      'ADNF: Merging two options with group, form or files. Note these options cannot be merged and will be replaced. Hide this and similar warnings with fetch(..., { warn: false }) option.'
    )
  }

  const mergedOptions = structuredClone({ ...prevOptions, ...options })

  if (prevOptions.headers || options.headers) {
    mergedOptions.headers = {
      ...prevOptions.headers,
      ...options.headers,
    }
  }

  if (prevOptions.data || options.data) {
    mergedOptions.data = {
      ...prevOptions.data,
      ...options.data,
    }
  }

  if (prevOptions.params || options.params) {
    mergedOptions.params = {
      ...prevOptions.params,
      ...options.params,
    }
  }

  return mergedOptions
}

export const isNullable = <V>(value: V): value is NonNullable<V> =>
  value === undefined || value === null

export const assert = <V>(value: V) => {
  if (isNullable(value)) throw new Error('Non-nullable assertion failed')
  return value!
}
