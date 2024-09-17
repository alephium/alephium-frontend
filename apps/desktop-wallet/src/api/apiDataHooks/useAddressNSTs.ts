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
import { useQueries, useQuery } from '@tanstack/react-query'

import useSeparateListedFromUnlistedTokens from '@/api/apiDataHooks/useSeparateListedFromUnlistedTokens'
import { addressTokensBalanceQuery } from '@/api/queries/addressQueries'
import { combineTokenTypeQueryResults, tokenTypeQuery } from '@/api/queries/tokenQueries'
import { addressLatestTransactionHashQuery } from '@/api/queries/transactionQueries'
import { useAppSelector } from '@/hooks/redux'

const useAddressNSTs = (addressHash: AddressHash) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const queryProps = { addressHash, networkId }

  const { data: txHashes, isLoading: isLoadingTxHashes } = useQuery(addressLatestTransactionHashQuery(queryProps))

  const { data, isLoading: isLoadingTokensBalances } = useQuery(
    addressTokensBalanceQuery({
      ...queryProps,
      latestTxHash: txHashes?.latestTxHash,
      previousTxHash: txHashes?.latestTxHash,
      skip: isLoadingTxHashes
    })
  )

  const {
    data: { unlistedTokens },
    isLoading: isLoadingUnlistedTokens
  } = useSeparateListedFromUnlistedTokens(data?.tokenBalances)

  const {
    data: { 'non-standard': nstIds },
    isLoading: isLoadingTokensByType
  } = useQueries({
    queries: unlistedTokens.map(({ id }) => tokenTypeQuery({ id })),
    combine: combineTokenTypeQueryResults
  })

  return {
    data: nstIds, // TODO: Add balances
    isLoading: isLoadingTxHashes || isLoadingTokensBalances || isLoadingUnlistedTokens || isLoadingTokensByType
  }
}

export default useAddressNSTs
