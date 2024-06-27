# ADNF + SWR

```tsx
import useSWR as useDefaultSWR from 'swr'
import { fetch as resultFetch, swr } from 'adnf'

const fetch = swr(resultFetch)

fetch.get('/api/user', { params: { id: "test" }})
// FetchDeclaration: { key: ["/api/user?id=test"], fetch }

const useSWR = ({ key, fetch }, options) => {
  return useDefaultSWR(key, fetch, { suspense: true, ...options })
}

const Profile = props => {
  const user = useSWR(fetch.get<User>('/api/user', { params: { id: props.id } }), {
    refreshInterval: 1000,
  })
}
```
