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

import { queryOptions, useQueries, UseQueryResult } from '@tanstack/react-query'
import { createHash } from 'crypto'

export const combineQueriesResult = <R>(result: UseQueryResult<R, Error>[]) => ({
  data: result.map((r) => r.data).filter((data): data is R => data !== undefined),
  isPending: result.some((r) => r.isPending)
})

// TODO: MAKE TYPING WORK.
export const useCombinedQueries = (queries: ReturnType<typeof queryOptions>[]) =>
  useQueries({
    queries,
    combine: combineQueriesResult
  })

// This is used to avoid querying the same data multiple times if the order of the query keys is different
// (but the content is the same)
export const hashArray = (arr: string[]) => simpleHash([...arr].sort().join(''))

const simpleHash = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return (hash >>> 0).toString(36)
}
