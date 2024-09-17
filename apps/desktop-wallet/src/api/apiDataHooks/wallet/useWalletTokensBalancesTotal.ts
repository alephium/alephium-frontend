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

import { combineIsLoading } from '@/api/apiDataHooks/utils'
import useWalletLastTransactionHashes from '@/api/apiDataHooks/wallet/useWalletLastTransactionHashes'
import { addressTokensBalancesQuery, AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { DisplayBalances, TokenDisplayBalances, TokenId } from '@/types/tokens'

const useWalletTokensBalancesTotal = () => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const { data: latestTxHashes, isLoading: isLoadingLatestTxHashes } = useWalletLastTransactionHashes()

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

export default useWalletTokensBalancesTotal

const combine = (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => {
  const tokenBalancesByTokenId = results.reduce(
    (tokensBalances, { data: balances }) => {
      balances?.balances.forEach(({ id, totalBalance, lockedBalance, availableBalance }) => {
        tokensBalances[id] = {
          totalBalance: totalBalance + (tokensBalances[id]?.totalBalance ?? BigInt(0)),
          lockedBalance: lockedBalance + (tokensBalances[id]?.lockedBalance ?? BigInt(0)),
          availableBalance: availableBalance + (tokensBalances[id]?.availableBalance ?? BigInt(0))
        }
      })
      return tokensBalances
    },
    {} as Record<TokenId, DisplayBalances>
  )

  return {
    data: Object.keys(tokenBalancesByTokenId).map((id) => ({
      id,
      ...tokenBalancesByTokenId[id]
    })) as TokenDisplayBalances[],
    ...combineIsLoading(results)
  }
}