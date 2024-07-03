import { debugFetch, withDeclarations, withOptions } from '../lib'

const fetch = withOptions(debugFetch, () => {
  return {}
})

const declare = withDeclarations(fetch)

const signIn = () => {
  return declare<{}, 'Unauthorized', { email: string; password: string }>('/user', args => {
    return { params: args }
  })
}

const main = async () => {
  const result = await signIn().fetch({ email: 'max@101.lu', password: 'pass' })

  console.log(result)
}

main()
