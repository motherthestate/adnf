# 🐕 ADNF

**A Dog Named Fetch** - A strict, tiny typescript fetch wrapper.

- [🐕 ADNF](#-adnf)
  - [Overview](#overview)
  - [The FetchResult](#the-fetchresult)
  - [Extend fetchers](#extend-fetchers)
  - [Reference](#reference)
    - [Fetchers](#fetchers)
      - [`fetch`](#fetch)
    - [Makers](#makers)
      - [`withMethods`](#withmethods)
      - [`withResource` & `withBase`](#withresource-withbase)
      - [`withOptions`](#withoptions)
      - [`🐛 withDeclarations`](#withdeclarations)
      - [`withFetch`](#withfetch)
      - [`unwrap` and `swr`](#unwrap-and-swr)
      - [`createAbortGroup`](#createabortgroup)
    - [Recipes](#recipes)
    - [Resources](#resources)
      - [Fetch dependency](#fetch-dependency)
      - [ADNF + SWR](#adnf-+-swr)

## Overview

```tsx
import { fetch } from 'adnf'

const result = await fetch<User>('/me') // Result<User, unknown>

result.user // undefined | User

if (result.success) {
  result.user satisfies User
}
```

## The FetchResult

The `fetch` function has 3 distinct result types. The `FetchResult<V, E>` type describes all three result types:

- `Success<V>`: Fetch was successful
- `ErrResponse<E>`: Fetch returned response but with error status code
- `Err`: No response. Strict error thrown, network error, fetch aborted

Additionally `FetchResult` extends a rust inspired `Result` wrapper proving a useful API.

```tsx
const result = await fetch<Flower | null, 'NoFlower'>('/flower') // FetchResult<Flower[], "NoFlower">

result.error // "NoFlower" | null | undefined
result.aborted // fetch was aborted
result.timeout // fetch was aborted due to a timeout
result.resolved // fetch was able to resolve to a request

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

## Extend fetchers

You can use the maker function `withOptions`, `withResource`, `withBase` and `withFetch` to extend a fetch.

```tsx
import { fetch, withBase } from 'adnf'

// base fetch config
const baseFetch = withOptions(fetch, { cache: 'no-cache' })
const apiFetch = withBase(baseFetch, '/api')
const authFetch = withOptions(apiFetch, options => ({
  headers: { Authorization: localStorage.get('token') },
}))

// Use `withMethods` to extend your fetch with http methods
const auth = withMethods(authFetch)

await auth.get('/me')
```

## Reference

### Fetchers

#### `fetch`

The `ResultFetch` returning a `FetchResult`

```tsx
import { fetch } from "adnf"

// ResultFetch
const result = fetch(
  resource: string,
  options: RequestInit & {
    fetch // fetch implementation, default: window.fetch
    strict: boolean // default: true
    timeout: number // timeout in ms. returns "Err" with timeout set to true
    group: AbortControllerGroup
    abortPrevious: boolean // aborts all previous fetches in provided AbortControllerGroup
    data: object // json body data
    params: Record<string, any> // search params
    form: FormData | FormDataRecord
    files: FormDataRecord
  }
)


result satisfies FetchResult
```

#### `debugFetch`

A fetch function that logs fetches. Does not perform the fetch.

```tsx
import { debugFetch } from 'adnf'

debugFetch('/user') // logs fetch to console
```

### Makers

#### `withMethods`

Extends your fetch with http methods. Note that this does not return a fetch signature but an object of fetches, meaning it can not be passed to other makers. Do this last.

```tsx
import { fetch, withMethods } from 'adnf'

const methods = withMethods(fetch)

methods.get('/') // fetch("/", { method: "get" })
methods.post('/') // fetch("/", { method: "post" })
```

#### `withResource` & `withBase`

Rewrite your fetch resource

```tsx
withResource(fetch, '/workspace')
// same as: withResource(fetch, (resource) => resource + "/workspace")

withBase(fetch, '/api')
// same as: withResource(fetch, (resource) => "/api" + resource)
```

#### `withOptions`

Extend your fetch options

```tsx
const noCacheFetch = withOptions(fetch, { cache: 'no-cache' })
const cacheFetch = withOptions(noCacheFetch, { cache: 'default' }) // overwrites cache

// pass a callback for fresh on-fetch options
const auth = withOptions(noCacheFetch, options => ({
  headers: { Authorization: localStorage.get('token') },
}))
```

#### `withDeclarations`

Helps with prepared fetches. Describe a fetch to run later. Additionally a fetch key is generated to identify requests.

```tsx
const declare = withDeclarations(fetch)

const fetchUser = id => declare('/user', { params: { id } })

const declaration = fetchUser('a')

declaration.key // "/user?id='a'"
declaration.fetch() // run fetch as usual
```

#### `withFetch`

Makes a fetch _dependent_. Generally prefer using `withResource` and `withOptions`. Used internally to implement other makers. Read more about [fetch dependency below](#fetch-dependency).

```tsx
const newFetch = withFetch(fetch, fetch => (resource, options) => fetch(resource, { ...options }))
```

#### `unwrap` and `swr`

If you’re working with a library that expects errors to be thrown i.e. [SWR](https://swr.vercel.app/docs/error-handling), use unwrap. Unwrapping fetch does not restore the Fetch API 1:1, primarily differences in behavior due to ResultFetch’s strict option.

```tsx
import { fetch as resultFetch, unwrap } from "adnf"

const fetch = unwrap(resultFetch)

const result = await = resultFetch<User>("/me") // FetchResult<User, unkown>
const user = await = fetch<User>("/me") // User
```

#### `createAbortGroup`

Creates a grouped abort controller.

```tsx
import { createAbortGroup } from 'adnf'

const group = createAbortGroup()

// use abortPrevious for grouped fetched before fetch
fetch.post('/upload', { abortPrevious: true, group }) // Err
fetch.post('/upload', { abortPrevious: true, group }) // Err
fetch.post('/upload', { abortPrevious: true, group }) // Success

// or manually
group.cancel()
```

### Recipes

#### Last wins and First wins

```tsx
import { fetch, createAbortGroup, ResultErr } from 'adnf'

// LWW
const group = createAbortGroup()

fetch('/a', { group, abortPrevious: true }) // Err
fetch('/b', { group, abortPrevious: true }) // Success | ErrResponse

// FWW
const group = createAbortGroup()

const patientFetch = resource => {
  if (group.controllers.length) return ResultErr({ aborted: true })
  group.fetch(resource, { group })
}

patientFetch('/a') // will resolve
patientFetch('/b') // will not resolve if "/a" fetch did not finish
```

#### Fetch logger

```tsx
import { fetch, useFetch } from 'adnf'

const loggedFetch = useFetch(fetch, fetch => (resource, options) => {
  console.log(options.method ?? 'get', resource, options)
  return fetch(resource, options)
})
```

### Resources

#### Fetch dependency

Dependent fetches follow other fetches. Maker functions return a special fetch that maintains a specific order.

When using `withFetch` the fetch provided in the creator is the **next** fetch. This is necessary to implement the extend like behavior makers like `withOptions`.

```tsx
const a = withFetch(fetch, b => b)
const b = withFetch(fetch, c => c)
const c = withFetch(b, fetch => fetch)

b() // will first call fetch creator a and then b.
```

Another example, the fetch returned from your creator is "cached" and are run in sequence.

```tsx
const a = withFetch(fetch, fetch => {
  console.log('init: a')
  return (resource, options) => {
    console.log('fetch: a')
    return fetch(resource, options)
  }
})

const b = withFetch(a, fetch => {
  console.log('init: b')
  return (resource, options) => {
    console.log('fetch: b')
    return fetch(resource, options)
  }
})

const c = withFetch(c, fetch => {
  console.log('init: c')
  return (resource, options) => {
    console.log('fetch: c')
    return fetch(resource, options)
  }
})

c()
// init: c
// init: b
// init: a
// fetch: a
// fetch: b
// fetch: c
```

#### ADNF + SWR

[See repo resources](https://github.com/weltmx/adnf/blob/main/resources/use-with-swr.md)
