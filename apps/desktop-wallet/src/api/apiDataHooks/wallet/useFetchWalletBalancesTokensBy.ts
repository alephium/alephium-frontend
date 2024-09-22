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

import { combineBalancesByAddress, combineBalancesByToken } from '@/api/apiDataHooks/wallet/combineBalances'
import useFetchWalletLastTransactionHashes from '@/api/apiDataHooks/wallet/useFetchWalletLastTransactionHashes'
import { addressTokensBalancesQuery, AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'

export const useFetchWalletBalancesTokensByToken = () => useFetchWalletBalancesTokensBy(combineBalancesByToken)

export const useFetchWalletBalancesTokensByAddress = () => useFetchWalletBalancesTokensBy(combineBalancesByAddress)

const useFetchWalletBalancesTokensBy = <T>(
  combine: (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => { data: T; isLoading: boolean }
) => {
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
    isLoading: isLoading || isLoadingLatestTxHashes
  }
}
