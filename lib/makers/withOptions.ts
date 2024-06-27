import { Fetch, FetchOptions } from "../types"
import { mergeOptions } from "../utils/utils"
import { withCreate } from "./withCreate"

export const withOptions = <F extends Fetch>(
  fetch: F,
  options: FetchOptions | ((options?: FetchOptions) => FetchOptions),
) => {
  return withCreate(fetch, (next) => (resource, opts) => {
    const nextOptions = typeof options === "function" ? options(opts) : options
    return next(resource, mergeOptions(opts, nextOptions))
  })
}
