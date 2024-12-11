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
