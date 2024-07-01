// import { debugFetch, params, withDeclarations, withOptions } from '../lib'

// // const b = withOptions(debugFetch, { method: 'get' })
// // const fetch = withDeclarations(b)

// // const userById = fetch<number, unknown, { id: string }>('/test', args => {
// //   return {
// //     params: { id: args.id },
// //   }
// // })

// // const main = async () => {
// //   const result = await userById.fetch({ id: 'a' })
// // }

// // main()

// console.log(params('/user', { id: 'a' }))
// console.log(params('https://developer.mozilla.org/user', { id: 'a' }))
// console.log(params('https://developer.mozilla.org/user?id=a&for=b', { id: 'a' }))
