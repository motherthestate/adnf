import { assert } from './utils'

const Ok = <V>(value: V) => {
  return {
    ok: true,
    value,
    data: value,
    except: undefined,
    failed: false,
    error: undefined,
    message: undefined,
    unwrap: () => value,
    log: () => void console.log(value),
    notNullable: () => assert(value),
  } as Ok<V>
}

export const Result = Object.assign(Ok, {
  Ok,
  Except: <E>(except: E, error: Error = new Error('Result.Except: No error provided')) => {
    const log = () => void console.error({ type: except, error, message: error?.message })
    return {
      value: undefined,
      except,
      data: except,
      error,
      message: error.message,
      failed: true,
      ok: false,
      log,
      unwrap: () => {
        log() // log error, otherwise type will be missing for debugging
        throw error
      },
      notNullable: () => {
        throw new Error('Result.distinct: Nullable value or error')
      },
    } as Except<E>
  },
})

/**
 * tcResult
 */

export const tcResult = <R>(tryFn: () => R) => {
  try {
    return Result.Ok(tryFn())
  } catch (err) {
    return Result.Except(null, isError(err) ? err : undefined)
  }
}

export const isError = (v: any): v is Error => v instanceof Error

// results

export type Ok<V> = {
  data: V
  value: V
  except: undefined
  failed: false
  error: undefined
  message: undefined
  ok: true
  unwrap: () => V
  log: () => void
  notNullable: () => NonNullable<V>
}

export type Except<E> = {
  data: E
  value: undefined
  except: E
  failed: true
  error: Error
  message: string
  ok: false
  unwrap: () => never
  log: () => void
  notNullable: () => never
}

export type Result<V = unknown, E = unknown> = Ok<V> | Except<E>
