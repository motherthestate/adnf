import { debugFetch, withDeclarations } from '../lib'

const fetch = withDeclarations(debugFetch)

const userById = (id: string) => fetch('/test', { params: { id } })

console.log(userById('a'))
