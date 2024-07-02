import { fetch, swrResult, withDeclarations } from '../lib'

const declare = withDeclarations(fetch)

const getUser = declare<{}, 'Unauthorized'>('/user')

const main = async () => {
  const result = await getUser.fetch().then(swrResult)
}

main()
