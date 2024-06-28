# ADNF + React 19

```tsx
import { fetch, withDeclarations, FetchDeclaration, FetchResult, ResultErr } from 'adnf'

const declareFetch = withDeclarations(fetch)

const userById = (id: string) =>
  declareFetch<{ id: string; name: string }, 'Unauthorized' | 'NotFound'>('/user', {
    params: { id },
  })

const useDeclaration = <V, E>(declaration: FetchDeclaration<V, E>) => {
  const [result, setResult] = React.useState<undefined | V>()
  const [loading, resultTransition] = React.useTransition()

  const revalidate = () => {
    resultTransition(async () => {
      setResult(await declaration.fetch())
    })
  }

  React.useEffect(() => {
    revalidate()
  }, [declaration.key])

  if (loading) return { loading: true, result: undefined }

  // result should never be undefined here, never the less
  if (!result) return { ...ResultErr(), loading: false }

  return { ...result, loading: false } as FetchResult<V, E> & { loading: false }
}

const UserProfile = (props: { id: string }) => {
  const user = useDeclaration(userById(props.id))

  if (user.loading) return 'Loading ...'
  if (user.failed) {
    if (user.error === 'NotFound') return 'No user found'
    if (user.error === 'Unauthorized') return 'Unauthorized'
    return 'Something went wrong'
  }

  return user.value.name
}
```
