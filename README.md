# 🐕 ADNF

**A Dog Named Fetch** - A strict, tiny typescript fetch wrapper.

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
    - [Helpers](#helpers)
      - [`createAbortGroup`](#createabortgroup)
      - [`params`](#params)
    - [Recipes](#recipes)
    - [Resources](#resources)
      - [Fetch dependency](#fetch-dependency)
      - [ADNF + SWR](#adnf-+-swr)

## Overview

```tsx
import { fetch } from 'adnf'

const result = await fetch<User>('/me') // Result<User, unknown>

result.user // undefined | User

if (result.ok) {
  result.user satisfies User
}
```

## The FetchResult

The `fetch` function has 3 result types. The `FetchResult<V, E>` type describes all three result types:

- `Ok<V>`: Fetch was successful
- `Except<E>`: Fetch returned response but with error status code
- `NoResponse`: Strict error thrown, network error, fetch aborted

Additionally `FetchResult` extends a rust inspired `Result` wrapper proving a useful API.

```tsx
const result = await fetch<Flower | null, 'NoFlower'>('/flower') // FetchResult<Flower[], "NoFlower">

// Unwrap your value
result.unwrap() // (throws Error) | Flower | null
result.notNullable() // (throws Error) | Flower

// Response data, irregardless of result type
result.data // Flower | null | 'NoFlower' | undefined

// Success data
if (result.ok) {
  result // Ok<Flower[]>
  result.value // Flower[]
}

// Error cases
if (result.failed) {
  if (result.response) {
    result // Except<'NoFlower'>
    result.except // "NoFlower"
    return
  }

  result // NoResponse
  result.error // the thrown Error object
  result.message // string
}

result.aborted // fetch was aborted
result.timeout // fetch was aborted due to a timeout
result.resolved // fetch was able to resolve to a request
```

## Extend fetchers

You can use the maker functions `withOptions`, `withResource`, `withBase` and `withFetch` to sequentially extend a fetch.

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

### [Fetchers](https://github.com/weltmx/adnf/tree/main/lib/fetchers)

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
    timeout: number // timeout in ms. returns "NoResponse" with timeout set to true
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

### [Makers](https://github.com/weltmx/adnf/tree/main/lib/makers)

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

Declares fetches instead of running them immediately. Helps with prepared fetches, creating services and generating an cache identifier `key`.

```tsx
import { fetch, withDeclarations, params } from 'adnf'

const declare = withDeclarations(fetch)

// Declare GET fetch

const getUser = (id: string) => declare<{}, 'Unauthorized'>('/user', { params: { id } })

const declaration = getUser('a')

declaration.key // /user?id=a
declaration.fetch() // run fetch as usual

declare('/user', { params: { id } }).key // /user?id=a
declare('/user', () => ({ params: { id } })).key // /user
declare(params('/user', { id })).key // /user?id=a
declare(`/user/${id}`).key // /user/a
declare(['/user', id]).key // /user/a

// Declare mutative fetch

import { params } from 'adnf'

const editFlower = (id: string) =>
  declare<{}, 'Unauthorized', Partial<Flower>>(params('/flower', { id }), flower => ({
    method: 'put',
    data: flower,
  }))

const declaration = editFlower('tulip')

declaration.key // /flower?id=tulip
```

For mutations where some arguments should not be part of the cache key, declare can be provided a function that will build options after the key was generated. Note that this will force your fetch to be a mutate method i.e. `post`, `put`, `delete` or `patch`.

```tsx
const fetchUser = declare<User, void, { id: string }>('/user', args => ({
  params: { id: args.id },
}))

declaration.key // "@"/user",#params,,"

const declaration = fetchUser.fetch({ id: 'a' }) // fetch('/user', { method: "post", params: { id: 'a' }, ... })
```

#### `withFetch`

Create fetch creators that run sequentially when initiating a fetch. Used to create a fetch that is _dependent_ on the next fetch. Used internally to implement other makers. Read more about [fetch dependency below](#fetch-dependency).

```tsx
const newFetch = withFetch(fetch, fetch => (resource, options) => fetch(resource, { ...options }))
```

### [Helpers](https://github.com/weltmx/adnf/tree/main/lib/helpers)

#### `createAbortGroup`

Creates a grouped abort controller.

```tsx
import { createAbortGroup } from 'adnf'

const group = createAbortGroup()

// use abortPrevious for grouped fetched before fetch
fetch.post('/upload', { abortPrevious: true, group }) // NoResponse
fetch.post('/upload', { abortPrevious: true, group }) // NoResponse
fetch.post('/upload', { abortPrevious: true, group }) // Ok

// or manually
group.cancel()
```

#### `params`

Merge/replace search params to resource or complete URL. Will respect provided format.

`params(path: string, params, replace: boolean)`

```ts
params('/user', { id: 'a' })
// /user?id=a
params('https://github.com/user?id=a&for=b', { id: 'b' })
// https://github.com/user?id=b&for=b
params('https://github.com/user?id=a&for=b', { id: 'b' }, true)
// https://github.com/user?id=b
```

### Recipes

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

Dependent fetches follow other fetches. Maker functions return a special fetch that maintains a specific order. When using `withFetch` the fetch provided in the creator is the **next** fetch. Your fetch creators are made "dependent" and run in sequence once you have initiated a fetch.

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
