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

import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import useFetchFtList from '@/api/apiDataHooks/useFetchFtList'
import { combineTokenTypeQueryResults, tokenTypeQuery } from '@/api/queries/tokenQueries'
import { ListedFT, TokenId, UnlistedToken } from '@/types/tokens'

interface TokensByType<T> {
  data: {
    listedFts: (ListedFT & T)[]
    unlistedTokens: (UnlistedToken & T)[]
    unlistedFTIds: TokenId[]
    nftIds: TokenId[]
    nstIds: TokenId[]
  }
  isLoading: boolean
}

const useFetchSeparatedTokensByType = <T extends UnlistedToken>(tokens: T[] = []): TokensByType<T> => {
  const { data: ftList, isLoading } = useFetchFtList({ skip: tokens.length === 0 })

  const { listedFts, unlistedTokens } = useMemo(() => {
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

  const {
    data: { fungible: unlistedFTIds, 'non-fungible': nftIds, 'non-standard': nstIds },
    isLoading: isLoadingTokensByType
  } = useQueries({
    queries: unlistedTokens.map(({ id }) => tokenTypeQuery({ id })),
    combine: combineTokenTypeQueryResults
  })

  return {
    data: { listedFts, unlistedTokens, unlistedFTIds, nftIds, nstIds }, // TODO: Consider adding balances instead of IDs?
    isLoading: isLoading || isLoadingTokensByType
  }
}

export default useFetchSeparatedTokensByType
