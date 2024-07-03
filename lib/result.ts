import { assert } from './helpers/utils'

const Success = <V>(value: V) => {
  return {
    value,
    failed: false,
    success: true,
    type: undefined,
    errorType: undefined,
    error: undefined,
    message: undefined,
    unwrap: () => value,
    log: () => void console.log(value),
    notNullable: () => assert(value),
  } as Success<V>
}

export const Result = Object.assign(Success, {
  Success,
  Err: <ET>(type: ET, error: Error = new Error('Result.Err: No error provided')) => {
    const log = () => void console.error({ type, error, message: error?.message })
    return {
      value: undefined,
      type,
      errorType: type,
      error,
      message: error.message,
      failed: true,
      success: false,
      log,
      unwrap: () => {
        log() // log error, otherwise type will be missing for debugging
        throw error
      },
      notNullable: () => {
        throw new Error('Result.distinct: Nullable value or error')
      },
    } as Err<ET>
  },
})

/**
 * tcResult
 */

export const tcResult = <R>(tryFn: () => R) => {
  try {
    return Result.Success(tryFn())
  } catch (err) {
    return Result.Err(null, isError(err) ? err : undefined)
  }
}

export const isError = (v: any): v is Error => v instanceof Error

// results

export type Success<V> = {
  value: V
  type: undefined
  errorType: undefined
  error: undefined
  message: undefined
  failed: false
  success: true
  unwrap: () => V
  log: () => void
  notNullable: () => NonNullable<V>
}

export type Err<T> = {
  value: undefined
  type: T
  failed: true
  errorType: T
  error: Error
  message: string
  success: false
  unwrap: () => never
  log: () => void
  notNullable: () => never
}

export type Result<V = unknown, E = unknown> = Success<V> | Err<E>
