import { mergeOptions } from '../helpers/utils'
import { Fetch, FetchOptions } from '../types'
import { withFetch } from './withFetch'

export const withOptions = <F extends Fetch>(
  fetch: F,
  options: FetchOptions | ((options?: FetchOptions) => FetchOptions)
) => {
  return withFetch(fetch, next => (resource, opts) => {
    const nextOptions = typeof options === 'function' ? options(opts) : options
    return next(resource, mergeOptions(opts, nextOptions))
  })
}
