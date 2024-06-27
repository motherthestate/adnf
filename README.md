# 🐕 ADNF
**A Dog Named Fetch** - A strict, tiny typescript fetch wrapper.

## Overview

```tsx
import { fetch } from "adnf"

const result = await fetch<User>("/me") // Result<User, unknown>

result.user // undefined | User

if (result.success) {
  result.user satisfies User
}
```

## The FetchResult

The `fetch` function has 3 distinct result types. The `FetchResult` type describes all three result types:

- `Success`: Fetch was successful
- `ErrResponse`: Fetch returned response but with error status code
- `Err`: No response. Strict error thrown, network error, fetch aborted

Additionally `FetchResult` extends a rust inspired `Result` wrapper proving a useful API.

```tsx
const result = await fetch<Flower | null, "KNOWN_ERROR">("/flower") // FetchResult<Flower[], unknown>

result.error // "KNOWN_ERROR" | null | undefined

// Unwrap your value:
result.unwrap() // (throws Error) | Flower | null
result.notNullable() // (throws Error) | Flower
result.log() // logs value or error if present

// Or handle your cases:
if (result.success) {
  result // Success<Flower[]>
  result.value // Flower[]
}

if (result.failed) {
  if (result.response) return result // ErrResponse
  result // Err
}
```

## Reference

### Fetchers

#### `fetch`

```tsx
import { fetch } from "adnf"

fetch(
  resource: string,
  options: RequestInit & {
    fetch // fetch implementation, default: window.fetch
    strict: boolean // default: true
    group: AbortControllerGroup
    abortPrevious: boolean
    data: object
    form: FormData | FormDataRecord
    files: FormDataRecord
    params: Record<string, any>
    unwrap: boolean
    timeout: number
  }
)
```

### Makers

#### `withMethods`

Extends your fetch with http methods.

```tsx
import { fetch, withMethods } from "adnf"

const methods = withMethods(fetch)

methods("/")                     // fetch("/", { method: "get" })
methods.get("/")                 // fetch("/", { method: "get" })
methods.post("/")                // fetch("/", { method: "post" })
```

#### `withResource` & `withBase`

Rewrite your fetch resource

```tsx
withResource(fetch, "/workspace")
// same as: withResource(fetch, (resource) => resource + "/workspace")

withBase(fetch, "/api")
// same as: withResource(fetch, (resource) => "/api" + resource)
```

#### `withOptions`

Extend your fetch options

```tsx
const noCacheFetch = withOptions(fetch, { cache: "no-cache" })
const cacheFetch = withOptions(noCacheFetch, { cache: "default" }) // overwrites cache

// pass a callback for fresh on-fetch options
const auth = withOptions(
  noCacheFetch,
  (options) => ({ headers: { Authorization: localStorage.get("token") } })
)

```

#### `withFetch`

Makes a fetch *dependent*. Generally prefer using `withResource` and `withOptions`. Used internally to implement other makers.

```tsx
const newFetch = withFetch(
  fetch,
  (fetch) => (resource, options) => fetch(resource, { ...options })
)
```

#### `unwrap`
#### `swr`
