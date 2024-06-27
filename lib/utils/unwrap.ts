import { FetchOptions, ResultFetch } from "../types"

export const unwrap = (fetch: ResultFetch) => {
  return <V = unknown, E = unknown>(url: string, options?: FetchOptions) => {
    return fetch<V, E>(url, options).then((result) => result.unwrap())
  }
}
