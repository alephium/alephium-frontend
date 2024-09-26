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

import { FIVE_MINUTES_MS, MAX_API_RETRIES, ONE_MINUTE_MS } from '@alephium/shared'
import { QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export const DELETE_INACTIVE_QUERY_DATA_AFTER = FIVE_MINUTES_MS

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ONE_MINUTE_MS,
      gcTime: DELETE_INACTIVE_QUERY_DATA_AFTER,
      retry: (failureCount, error) => {
        if (
          (error instanceof AxiosError && error.response?.status !== 429) ||
          (error instanceof String && !error?.message?.includes('Status code: 429'))
        ) {
          return false
        } else if (failureCount > MAX_API_RETRIES) {
          console.error(`API failed after ${MAX_API_RETRIES} retries, won't retry anymore`, error)
          return false
        }

        return true
      }
    }
  }
})

export default queryClient
