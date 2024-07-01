import { Result } from '../result'
import { Fetch } from '../types'

export const voidFetch = (async (resource, options) => {
  return Object.assign(Result({}), {
    aborted: false,
    timeout: false,
    response: new Response(),
  } as const)
}) as Fetch<any, any>
