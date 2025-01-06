/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

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
