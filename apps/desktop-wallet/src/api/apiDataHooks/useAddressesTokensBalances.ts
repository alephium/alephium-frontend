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
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import useAddressesLastTransactionHashes from '@/api/apiDataHooks/useAddressesLastTransactionHashes'
import { combineDefined } from '@/api/apiDataHooks/utils'
import useFetchWalletAlphBalancesByAddress, {
  AddressesAlphBalances
} from '@/api/apiDataHooks/wallet/useFetchWalletAlphBalancesByAddress'
import { addressTokensBalancesQuery, AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { TokenDisplayBalances } from '@/types/tokens'

export interface AddressesTokensBalances {
  data: Record<AddressHash, TokenDisplayBalances[] | undefined>
  isLoading: boolean
}

const useAddressesTokensBalances = (addressHash?: AddressHash): AddressesTokensBalances => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchWalletAlphBalancesByAddress()
  const { data: latestTxHashes, isLoading: isLoadingLatestTxHashes } = useAddressesLastTransactionHashes(addressHash)

  const { data: tokensBalances, isLoading } = useQueries({
    queries: latestTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressTokensBalancesQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine: combineDefined
  })

  return {
    data: useMemo(() => combineAlphAndTokens(alphBalances, tokensBalances), [alphBalances, tokensBalances]),
    isLoading: isLoadingAlphBalances || isLoadingLatestTxHashes || isLoading
  }
}

export default useAddressesTokensBalances

const combineAlphAndTokens = (
  alphBalances: AddressesAlphBalances['data'],
  tokensBalances: AddressTokensBalancesQueryFnData[]
): AddressesTokensBalances['data'] =>
  tokensBalances.reduce(
    (acc, { addressHash, balances }) => {
      const addressAlphBalances = alphBalances[addressHash]

      acc[addressHash] =
        addressAlphBalances && addressAlphBalances.totalBalance > 0
          ? [{ id: ALPH.id, ...addressAlphBalances }, ...balances]
          : balances

      return acc
    },
    {} as AddressesTokensBalances['data']
  )
