// import { debugFetch, params, withBase, withDeclarations, withOptions } from '../lib'

// const fetch = withOptions(withBase(debugFetch, '/api'), {})

// const declare = withDeclarations(fetch)

// const id = 'a'

// console.log(
//   declare('/user', { params: { id } }).key, // /user?id=a
//   declare('/user', () => ({ params: { id } })).key, // /user
//   declare(params('/user', { id })).key, // /user?id=a
//   declare(`/user/${id}`).key, // /user/a
//   declare(['/user', id]).key // /user/a
// )
