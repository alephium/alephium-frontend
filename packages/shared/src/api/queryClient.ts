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

import { QueryClient } from '@tanstack/react-query'

import { MAX_API_RETRIES } from '@/api'
import { ONE_MINUTE_MS } from '@/constants'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retryDelay: (attemptIndex) => Math.pow(2, attemptIndex) * 1000,
      retry: (failureCount, error) => {
        if (failureCount > MAX_API_RETRIES) {
          console.error(`API failed after ${MAX_API_RETRIES} retries, won't retry anymore. Error: ${error.message}.`)
          console.log(error)
          return false
        } else return true
      },
      staleTime: ONE_MINUTE_MS // default ms before cache data is considered stale
    }
  }
})
