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

import { useMemo } from 'react'

import useFetchFtList from '@/api/apiDataHooks/utils/useFetchFtList'
import { ListedFT, UnlistedToken } from '@/types/tokens'

interface TokensByListing<T> {
  data: {
    listedFts: (ListedFT & T)[]
    unlistedTokens: (UnlistedToken & T)[]
  }
  isLoading: boolean
}

const useFetchTokensSeparatedByListing = <T extends UnlistedToken>(tokens: T[] = []): TokensByListing<T> => {
  const { data: ftList, isLoading } = useFetchFtList({ skip: tokens.length === 0 })

  const data = useMemo(() => {
    const initial = { listedFts: [] as (ListedFT & T)[], unlistedTokens: [] as (UnlistedToken & T)[] }

    if (!ftList) return initial

    return tokens.reduce((acc, token) => {
      const listedFT = ftList?.find((t) => t.id === token.id)

      if (listedFT) {
        acc.listedFts.push({ ...listedFT, ...token })
      } else {
        acc.unlistedTokens.push(token)
      }

      return acc
    }, initial)
  }, [ftList, tokens])

  return {
    data,
    isLoading
  }
}

export default useFetchTokensSeparatedByListing
