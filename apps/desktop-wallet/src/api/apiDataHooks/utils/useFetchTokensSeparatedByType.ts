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

import useFetchTokensSeparatedByListing from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByListing'
import { combineTokenTypeQueryResults, tokenTypeQuery } from '@/api/queries/tokenQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/settings/networkSelectors'
import { ListedFT, TokenId, UnlistedToken } from '@/types/tokens'

interface TokensByType<T> {
  data: {
    listedFts: (ListedFT & T)[]
    unlistedTokens: (UnlistedToken & T)[]
    unlistedFtIds: TokenId[]
    nftIds: TokenId[]
    nstIds: TokenId[]
  }
  isLoading: boolean
}

const useFetchTokensSeparatedByType = <T extends UnlistedToken>(tokens: T[] = []): TokensByType<T> => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)

  const {
    data: { listedFts, unlistedTokens },
    isLoading: isLoadingTokensByListing
  } = useFetchTokensSeparatedByListing(tokens)

  const {
    data: { fungible: unlistedFtIds, 'non-fungible': nftIds, 'non-standard': nstIds },
    isLoading: isLoadingTokensByType
  } = useQueries({
    queries: unlistedTokens.map(({ id }) => tokenTypeQuery({ id, networkId })),
    combine: combineTokenTypeQueryResults
  })

  return {
    data: { listedFts, unlistedTokens, unlistedFtIds, nftIds, nstIds }, // TODO: Consider adding balances instead of IDs?
    isLoading: isLoadingTokensByListing || isLoadingTokensByType
  }
}

export default useFetchTokensSeparatedByType
