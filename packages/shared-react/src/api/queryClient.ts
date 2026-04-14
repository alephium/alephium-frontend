import { FIVE_MINUTES_MS, ONE_MINUTE_MS } from '@alephium/shared'
import { QueryClient, QueryClientConfig } from '@tanstack/react-query'

import { FetchError } from './fetchUtils'

const MAX_RETRIES = 10
const RETRY_ERROR_CODE = 429

// Unfortunately, Tanstack's retry callback does not include an argument for the status code. The web3 package returns
// a string message that includes the status code (see convertHttpResponse).
const shouldRetryAlephiumApi = (error: Error) => error?.message?.includes(`Status code: ${RETRY_ERROR_CODE}`)
const shouldRetryFetch = (error: FetchError) => error?.status === RETRY_ERROR_CODE

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: ONE_MINUTE_MS,
      gcTime: FIVE_MINUTES_MS,
      retry: (failureCount, error) =>
        failureCount < MAX_RETRIES && (shouldRetryAlephiumApi(error) || shouldRetryFetch(error as FetchError))
    }
  }
}

export const queryClient = new QueryClient(queryClientConfig)

// Useful for debugging
// queryClient.getQueryCache().subscribe((event) => {
//   console.log('event', event)
// })
