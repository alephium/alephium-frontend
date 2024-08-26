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
import { ALPH } from '@alephium/token-list'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'

import { addressTokensBalanceQuery, AddressTokensBalancesQueryFnData } from '@/api/addressQueries'
import { useAddressesLastTransactionHashes } from '@/api/addressTransactionsDataHooks'
import useAddressesAlphBalancesTotal from '@/api/apiDataHooks/useAddressesAlphBalancesTotal'
import { combineIsLoading } from '@/api/apiDataHooks/utils'
import { useAppSelector } from '@/hooks/redux'
import { DisplayBalances } from '@/types/tokens'

interface AddressesTokensBalancesTotal {
  data: Record<TokenId, DisplayBalances | undefined>
  isLoading: boolean
}

type TokenId = string

const useAddressesTokensBalancesTotal = (addressHash?: AddressHash): AddressesTokensBalancesTotal => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useAddressesAlphBalancesTotal(addressHash)
  const { data: latestTxHashes, isLoading: isLoadingLatestTxHashes } = useAddressesLastTransactionHashes(addressHash)

  const { data, isLoading } = useQueries({
    queries: latestTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressTokensBalanceQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine
  })

  const alphAndTokensBalances = useMemo(
    () => ({
      ...data,
      [ALPH.id]: alphBalances
    }),
    [alphBalances, data]
  )

  return {
    data: alphAndTokensBalances,
    isLoading: isLoadingAlphBalances || isLoadingLatestTxHashes || isLoading
  }
}

export default useAddressesTokensBalancesTotal

const combine = (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]): AddressesTokensBalancesTotal => ({
  data: results.reduce(
    (tokensBalances, { data: balances }) => {
      balances?.tokenBalances.forEach(({ id, totalBalance, lockedBalance, availableBalance }) => {
        tokensBalances[id] = {
          totalBalance: totalBalance + (tokensBalances[id]?.totalBalance ?? BigInt(0)),
          lockedBalance: lockedBalance + (tokensBalances[id]?.lockedBalance ?? BigInt(0)),
          availableBalance: availableBalance + (tokensBalances[id]?.availableBalance ?? BigInt(0))
        }
      })
      return tokensBalances
    },
    {} as AddressesTokensBalancesTotal['data']
  ),
  ...combineIsLoading(results)
})
