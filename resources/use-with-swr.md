# ADNF + SWR

```tsx
import { FetchDeclaration, SWRError, fetch, voidFetch, swr, withDeclarations } from 'adnf'
import useDefaultSWR, { SWRConfiguration } from "swr"
import useDefaultSWRMutation, { SWRMutationConfiguration } from "swr/mutation"

const declareFetch = withDeclarations(swr(fetch))

/**
 * SWR Hooks
 */

export const useSWR = <V, E>(
  declaration: FetchDeclaration<V, E> | null,
  config?: SWRConfiguration<V, SWRError<E>>,
) => {
  return useDefaultSWR<V, SWRError<E>>(
    declaration ? declaration.key : null,
    declaration ? declaration.fetch : voidFetch,
    config,
  )
}

export const useSWRMutation = <V, E, A>(
  declaration: FetchDeclaration<V, E, A> | null,
  config?: SWRMutationConfiguration<V, SWRError<E>, string, A, V>
) => {
  return useDefaultSWRMutation<V, SWRError<E>, string | null, A>(
    declaration ? declaration.key : null,
    (key, { arg }) => {
      if (!declaration) throw new Error("useSWRMutation: Triggered with no declaration")
      return declaration.fetch(arg)
    },
    config,
  )
}

/**
 * Services
 */

const userById = (id: string) =>
  declareFetch<{ id: string; name: string }>('/user', { params: { id } })

const updateUser = () =>
  declareFetch<{ id: string; name: string }, void, { id: string }>('/user', (arg) => ({
    method: "post",
    params: { id: arg.id }
  }))

const createStage = useSWRMutation(updateUser())

/*
 * Use in component
 */

const UserProfile = (props: { id: string }) => {
  const { isLoading, data: user, error } = useSWR(userById(props.id))

  if (isLoading) return 'Loading ...'
  if (error || !user) {
    if (error.status === 401) return 'Unauthorized'
    return 'Something went wrong'
  }

  return user.id
}
```
