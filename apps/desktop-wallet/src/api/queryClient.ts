import { FIVE_MINUTES_MS, ONE_MINUTE_MS } from '@alephium/shared'
import { QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ONE_MINUTE_MS,
      gcTime: FIVE_MINUTES_MS,
      retry: (failureCount, error) => {
        if (
          (error instanceof AxiosError && error.response?.status !== 429) ||
          (error instanceof String && !error?.message?.includes('Status code: 429'))
        ) {
          return false
        }

        return true
      }
    }
  }
})

// Useful for debugging
// queryClient.getQueryCache().subscribe((event) => {
//   console.log('event', event)
// })

export default queryClient
