# ADNF + SWR

```tsx
import useDefaultSWR, { SWRConfiguration } from 'swr'
import { FetchDeclaration, SWRError, fetch, swr, withDeclarations } from 'adnf'

const declareFetch = withDeclarations(swr(fetch))

const useSWR = <V, E>({ key, fetch }: FetchDeclaration<V, E>, config?: SWRConfiguration) => {
  return useDefaultSWR<V, SWRError<E>>(key, fetch, config)
}

const userById = (id: string) =>
  declareFetch<{ id: string; name: string }, 'Errr'>('/user', { params: { id } })

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
