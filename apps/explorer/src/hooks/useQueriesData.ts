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

import { QueryKey, useQueries, UseQueryOptions } from '@tanstack/react-query'
import { some } from 'lodash'

export const useQueriesData = <TQueryFnData, TError, TData, TQueryKey extends QueryKey>(
  queries: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>[]
) => {
  const results = useQueries({ queries })

  return results.reduce(
    (acc, r) => {
      if (r.data) {
        acc.data.push(r.data as NonNullable<TQueryFnData>)
      }
      acc.loadingArray.push(r.isLoading)
      acc.isLoading = some(acc.loadingArray, (l) => l === true)
      return acc
    },
    { data: [] as NonNullable<TQueryFnData>[], loadingArray: [] as boolean[], isLoading: false }
  )
}
