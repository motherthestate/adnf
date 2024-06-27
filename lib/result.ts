import { assert } from './utils/utils'

const Success = <V>(value: V) => {
  return {
    value,
    failed: false,
    success: true,
    error: undefined,
    unwrap: () => value,
    log: () => void console.log(value),
    notNullable: () => assert(value),
  } as Success<V>
}

export const Result = Object.assign(Success, {
  Success,
  Err: <ET>(error: ET, message?: unknown) => {
    return {
      value: undefined,
      error,
      failed: true,
      success: false,
      log: () => void console.error({ type: error, message }),
      unwrap: () => {
        if (typeof error === 'string') throw new Error(error)
        if (typeof message === 'string') throw new Error(message)
        console.error(`Result.error: `, { error, message })
        throw new Error('Result.error: Unknown error')
      },
      notNullable: () => {
        throw new Error('Result.distinct: Nullable value or error')
      },
    } as Err<ET>
  },
})

// results

export type Success<V> = {
  value: V
  error: undefined
  failed: false
  success: true
  unwrap: () => V
  log: () => void
  notNullable: () => NonNullable<V>
}

export type Err<E> = {
  value: undefined
  error: E
  failed: true
  success: false
  unwrap: () => never
  log: () => void
  notNullable: () => never
}

export type Result<V = unknown, E = unknown> = Success<V> | Err<E>
