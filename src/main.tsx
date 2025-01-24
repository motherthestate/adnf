import { params } from '../lib'

console.log(params('', { a: 'a' }))
console.log(params('/', { a: 'a' }))
console.log(params('?test', { a: 'a' }))
console.log(params('/?test', { a: 'a' }))
