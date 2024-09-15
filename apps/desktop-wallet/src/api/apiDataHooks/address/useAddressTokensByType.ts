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

import { AddressHash } from '@alephium/shared'
import { useQueries } from '@tanstack/react-query'

import useAddressTokensBalances from '@/api/apiDataHooks/address/useAddressTokensBalances'
import useSeparateListedFromUnlistedTokens from '@/api/apiDataHooks/useSeparateListedFromUnlistedTokens'
import { combineTokenTypeQueryResults, tokenTypeQuery } from '@/api/queries/tokenQueries'

const useAddressTokensByType = (addressHash: AddressHash) => {
  const { data, isLoading: isLoadingTokensBalances } = useAddressTokensBalances(addressHash)

  const {
    data: { listedFTs, unlistedTokens },
    isLoading: isLoadingUnlistedTokens
  } = useSeparateListedFromUnlistedTokens(data?.balances)

  const {
    data: { fungible: unlistedFTIds, 'non-fungible': nftIds, 'non-standard': nstIds },
    isLoading: isLoadingTokensByType
  } = useQueries({
    queries: unlistedTokens.map(({ id }) => tokenTypeQuery({ id })),
    combine: combineTokenTypeQueryResults
  })

  return {
    // TODO: Add balances?
    data: { listedFTs, unlistedFTIds, nftIds, nstIds },
    isLoading: isLoadingTokensBalances || isLoadingUnlistedTokens || isLoadingTokensByType
  }
}

export default useAddressTokensByType
