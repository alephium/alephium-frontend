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
