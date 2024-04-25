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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { QueryOptions, queryOptions, useQueries, UseQueryResult } from '@tanstack/react-query'

type QueryFn<T> = (...args: any[]) => QueryOptions<T, unknown, T, string[]>

interface Queries<T> {
  [key: string]: QueryFn<T>
}

type QueriesCollection<T> = {
  [P in keyof T]: Queries<T[P]>
}

export const createQueriesCollection = <T extends Record<string, Queries<any>>>(collection: T): QueriesCollection<T> =>
  collection

export const combineQueriesResult = <T>(results: UseQueryResult<T, Error>[]) => ({
  data: results.flatMap((result) => result.data || []),
  pending: results.flatMap((result) => result.isPending)
})

// TODO: MAKE TYPING WORK.
export const useCombinedQueries = (queries: ReturnType<typeof queryOptions>[]) =>
  useQueries({
    queries,
    combine: combineQueriesResult
  })
