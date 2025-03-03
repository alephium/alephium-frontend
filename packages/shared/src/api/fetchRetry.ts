import fetchRetry from 'fetch-retry'
import pThrottle from 'p-throttle'

export const MAX_API_RETRIES = 3

export const exponentialBackoffFetchRetry = fetchRetry(fetch, {
  retryOn: (attempt, error, response) => {
    if (attempt > MAX_API_RETRIES) console.error(`API failed after ${MAX_API_RETRIES} retries, won't retry anymore`)

    return !!response && response.status === 429
  },
  retries: MAX_API_RETRIES + 1,
  retryDelay: (attempt) => Math.pow(2, attempt) * 1000
})

const throttle = pThrottle({
  limit: 10,
  interval: 1000
})

export const throttledExponentialBackoffFetchRetry = throttle(exponentialBackoffFetchRetry)
