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

import { AddressHash, DisplayBalances } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useQueries } from '@tanstack/react-query'

import { addressAlphBalanceQuery, addressTokensBalanceQuery } from '@/api/addressQueries'
import { useAddressesLastTransactionHashes } from '@/api/addressTransactionsDataHooks'
import { useAppSelector } from '@/hooks/redux'

type TokenId = string

export const useAddressesAlphBalances = (addressHash?: AddressHash) => {
  const { data: latestAddressesTxHashes } = useAddressesLastTransactionHashes(addressHash)
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const { data, isLoading } = useQueries({
    queries: latestAddressesTxHashes.map(({ addressHash, latestTxHash }) =>
      addressAlphBalanceQuery({ addressHash, latestTxHash, networkId })
    ),
    combine: (results) => ({
      data: results.reduce(
        (totalBalances, { data }) => {
          totalBalances.balance += data ? BigInt(data.balance) : BigInt(0)
          totalBalances.lockedBalance += data ? BigInt(data.lockedBalance) : BigInt(0)

          return totalBalances
        },
        {
          balance: BigInt(0),
          lockedBalance: BigInt(0)
        } as DisplayBalances
      ),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    data,
    isLoading
  }
}

export const useAddressesTokensBalances = (addressHash?: AddressHash) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const { data: latestAddressesTxHashes } = useAddressesLastTransactionHashes(addressHash)
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useAddressesAlphBalances(addressHash)

  const { data, isLoading } = useQueries({
    queries: latestAddressesTxHashes.map(({ addressHash, latestTxHash }) =>
      addressTokensBalanceQuery({ addressHash, latestTxHash, networkId })
    ),
    combine: (results) => ({
      data: results.reduce(
        (tokensBalances, { data: balances }) => {
          balances?.forEach(({ tokenId, balance, lockedBalance }) => {
            tokensBalances[tokenId] = {
              balance: BigInt(balance) + (tokensBalances[tokenId]?.balance ?? BigInt(0)),
              lockedBalance: BigInt(lockedBalance) + (tokensBalances[tokenId]?.lockedBalance ?? BigInt(0))
            }
          })
          return tokensBalances
        },
        // Include ALPH in the results
        { [ALPH.id]: alphBalances } as Record<TokenId, DisplayBalances | undefined>
      ),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    data,
    isLoading: isLoadingAlphBalances || isLoading
  }
}
