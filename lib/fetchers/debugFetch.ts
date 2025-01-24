import { Result } from '../helpers/result'
import { ResultFetch } from '../types'

export const debugFetch = (async (resource, options) => {
  console.log(
    '%c🐕 ' + (options?.method || 'GET').toUpperCase(),
    'background: #85ce47; border-radius: 999px; font-weight: 600; padding: 1.5px 5.5px; color: black',
    resource,
    options
  )
  return Object.assign(Result.Ok({ resource, options }), {
    aborted: false,
    timeout: false,
    response: new Response(),
  } as const)
}) as ResultFetch
