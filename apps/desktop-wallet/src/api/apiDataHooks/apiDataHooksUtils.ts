import { UseQueryResult } from '@tanstack/react-query'

import { isDefined } from '@/utils/misc'

export const combineIsLoading = <R>(results: UseQueryResult<R, Error>[]) => ({
  isLoading: results.some(({ isLoading }) => isLoading)
})

export const combineIsFetching = <R>(results: UseQueryResult<R, Error>[]) => ({
  isFetching: results.some(({ isFetching }) => isFetching)
})

export const combineError = <R>(results: UseQueryResult<R, Error>[]) => ({
  error: results.some(({ error }) => error)
})

export const flatMapCombine = <R>(results: UseQueryResult<R | R[], Error>[]) => ({
  data: results.flatMap(({ data }) => data).filter(isDefined),
  ...combineIsLoading(results)
})

export const combineDefined = <R>(results: UseQueryResult<R, Error>[]) => ({
  data: results.reduce((acc, { data }) => {
    if (data !== undefined && data !== null) acc.push(data)
    return acc
  }, [] as NonNullable<R>[]),
  ...combineIsLoading(results)
})
