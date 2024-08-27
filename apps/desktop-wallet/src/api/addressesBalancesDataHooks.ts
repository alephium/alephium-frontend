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

import { AddressHash, DisplayBalances, TokenDisplayBalances } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { addressAlphBalanceQuery, addressTokensBalanceQuery } from '@/api/addressQueries'
import { useAddressesLastTransactionHashes } from '@/api/addressTransactionsDataHooks'
import { useAppSelector } from '@/hooks/redux'
import { isDefined } from '@/utils/misc'

type TokenId = string

export const useAddressesAlphBalances = (addressHash?: AddressHash) => {
  const { data: latestTxHashes, isLoading: isLoadingLatestTxHashes } = useAddressesLastTransactionHashes(addressHash)
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const { data, isLoading } = useQueries({
    queries: latestTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressAlphBalanceQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine: (results) => ({
      data: results.reduce(
        (acc, { data }) => {
          if (data) {
            acc[data.addressHash] = data.balances
          }
          return acc
        },
        {} as Record<AddressHash, DisplayBalances | undefined>
      ),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    data,
    isLoading: isLoading || isLoadingLatestTxHashes
  }
}

export const useAddressesTotalAlphBalances = (addressHash?: AddressHash) => {
  const { data: latestTxHashes, isLoading: isLoadingLatestTxHashes } = useAddressesLastTransactionHashes(addressHash)
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const { data, isLoading } = useQueries({
    queries: latestTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressAlphBalanceQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine: (results) => ({
      data: results.reduce(
        (totalBalances, { data }) => {
          totalBalances.balance += data ? data.balances.balance : BigInt(0)
          totalBalances.lockedBalance += data ? data.balances.lockedBalance : BigInt(0)

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
    isLoading: isLoading || isLoadingLatestTxHashes
  }
}

export const useAddressesTokensBalances = (addressHash?: AddressHash) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useAddressesAlphBalances(addressHash)
  const { data: latestTxHashes, isLoading: isLoadingLatestTxHashes } = useAddressesLastTransactionHashes(addressHash)

  const { data, isLoading } = useQueries({
    queries: latestTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressTokensBalanceQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine: (results) => ({
      data: results.map(({ data }) => data).filter(isDefined),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    data: useMemo(
      () =>
        data.reduce(
          (acc, { addressHash, tokenBalances }) => {
            const addressAlphBalances = alphBalances[addressHash]
            acc[addressHash] = addressAlphBalances
              ? [{ id: ALPH.id, ...addressAlphBalances }, ...tokenBalances]
              : tokenBalances

            return acc
          },
          {} as Record<AddressHash, TokenDisplayBalances[] | undefined>
        ),
      [alphBalances, data]
    ),
    isLoading: isLoadingAlphBalances || isLoadingLatestTxHashes || isLoading
  }
}

export const useAddressesTotalTokensBalances = (addressHash?: AddressHash) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useAddressesTotalAlphBalances(addressHash)
  const { data: latestTxHashes, isLoading: isLoadingLatestTxHashes } = useAddressesLastTransactionHashes(addressHash)

  const { data, isLoading } = useQueries({
    queries: latestTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressTokensBalanceQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine: (results) => ({
      data: results.reduce(
        (tokensBalances, { data: balances }) => {
          balances?.tokenBalances.forEach(({ id, balance, lockedBalance }) => {
            tokensBalances[id] = {
              balance: balance + (tokensBalances[id]?.balance ?? BigInt(0)),
              lockedBalance: lockedBalance + (tokensBalances[id]?.lockedBalance ?? BigInt(0))
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
    isLoading: isLoadingAlphBalances || isLoadingLatestTxHashes || isLoading
  }
}

export const useAddressAvailableBalance = (addressHash: AddressHash) => {
  const { data } = useAddressesTotalAlphBalances(addressHash)

  return data.balance - data.lockedBalance
}