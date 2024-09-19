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

import { useQueries, UseQueryResult } from '@tanstack/react-query'

import { combineBalancesByToken } from '@/api/apiDataHooks/wallet/combineBalances'
import useFetchWalletLastTransactionHashes from '@/api/apiDataHooks/wallet/useFetchWalletLastTransactionHashes'
import { addressTokensBalancesQuery, AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { TokenDisplayBalances } from '@/types/tokens'

const useFetchWalletBalancesTokens = () => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const { data: latestTxHashes, isLoading: isLoadingLatestTxHashes } = useFetchWalletLastTransactionHashes()

  const { data, isLoading } = useQueries({
    queries: latestTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressTokensBalancesQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine
  })

  return {
    data,
    isLoading: isLoadingLatestTxHashes || isLoading
  }
}

export default useFetchWalletBalancesTokens

const combine = (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => {
  const { data: tokenBalancesByToken, isLoading } = combineBalancesByToken(results)

  return {
    data: Object.keys(tokenBalancesByToken).map((id) => ({
      id,
      ...tokenBalancesByToken[id]
    })) as TokenDisplayBalances[],
    isLoading
  }
}
