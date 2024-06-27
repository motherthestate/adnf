import { Fetch } from "../types"
import { withOptions } from "./withOptions"

/**
 * withMethods
 */

export const withMethods = <F extends Fetch>(fetch: F) => {
  const method = (method: string) => withOptions(fetch, { method })

  const get = method("get")

  return Object.assign(get, {
    get,
    method,
    head: method("head"),
    post: method("post"),
    put: method("put"),
    delete: method("delete"),
    del: method("delete"),
    patch: method("patch"),
  })
}
