import useDefaultSWR, { SWRConfiguration } from 'swr'
import { FetchDeclaration, SWRError, debugFetch as fetch, swr, withDeclarations } from '../lib'

const test = swr(fetch)

const declare = withDeclarations(swr(fetch))

const useSWR = <V, E>({ key, fetch }: FetchDeclaration<V, E>, options?: SWRConfiguration) => {
  return useDefaultSWR<V, SWRError<E>>(key, fetch, options)
}

const Profile = (props: { id: string }) => {
  const test = declare<{ id: string; name: string }, 'Errr'>('/user', { params: { id: props.id } })

  const {
    isLoading,
    data: user,
    error,
  } = useSWR(declare<{ id: string; name: string }, 'Errr'>('/user', { params: { id: props.id } }))

  if (isLoading) {
    return
  }

  if (error) {
    error
    return
  }

  user
}
