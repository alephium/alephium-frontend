import fetchRetry from 'fetch-retry'

export const MAX_API_RETRIES = 3

export const exponentialBackoffFetchRetry = fetchRetry(fetch, {
  retryOn: (attempt: number, error: Error | null, response: Response | null) => {
    if (attempt > MAX_API_RETRIES) console.error(`API failed after ${MAX_API_RETRIES} retries, won't retry anymore`)

    return !!response && response.status === 429
  },
  retries: MAX_API_RETRIES + 1,
  retryDelay: (attempt: number) => Math.pow(2, attempt) * 1000
})
