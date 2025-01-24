import { mergeOptions } from '../helpers/utils'
import { FetchOptions, ResultFetch } from '../types'
import { withMiddleware } from './withMiddleware'

export const withOptions = <F extends ResultFetch>(
  fetch: F,
  options: FetchOptions | ((options?: FetchOptions) => FetchOptions)
) => {
  return withMiddleware(fetch, nextFetch => (resource, opts) => {
    const nextOptions = typeof options === 'function' ? options(opts) : options
    return nextFetch(resource, mergeOptions(opts, nextOptions))
  })
}
