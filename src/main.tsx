// import useDefaultSWR, { SWRConfiguration } from 'swr'
// import {
//   FetchDeclaration,
//   SWRError,
//   debugFetch as fetch,
//   swr,
//   withBase,
//   withDeclarations,
//   withOptions,
// } from '../lib'

// const baseFetch = withBase(fetch, '/api')
// const configuredFetch = withOptions(baseFetch, { strict: true, cache: 'default' })

// const declareFetch = withDeclarations(swr(configuredFetch))

// const useSWR = <V, E>({ key, fetch }: FetchDeclaration<V, E>, config?: SWRConfiguration) => {
//   return useDefaultSWR<V, SWRError<E>>(key, fetch, config)
// }

// const userById = (id: string) =>
//   declareFetch<{ id: string; name: string }, 'Errr'>('/user', { params: { id } })

// const Profile = (props: { id: string }) => {
//   const { isLoading, data: user, error } = useSWR(userById(props.id))
// }
