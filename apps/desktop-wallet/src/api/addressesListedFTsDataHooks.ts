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
import { explorer } from '@alephium/web3'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { addressTokensBalanceQuery } from '@/api/addressQueries'
import { useAddressesLastTransactionHashes } from '@/api/addressTransactionsDataHooks'
import useAddressesAlphBalancesTotal from '@/api/apiDataHooks/useAddressesAlphBalancesTotal'
import { useFungibleTokenList } from '@/api/fungibleTokenListDataHooks'
import { useAppSelector } from '@/hooks/redux'
import { ListedFT } from '@/types/tokens'

export const useAddressesListedFTs = (addressHash?: AddressHash) => {
  const { data: fungibleTokenList, isLoading: isLoadingFungibleTokenList } = useFungibleTokenList()
  const { data: latestAddressesTxHashes, isLoading: isLoadingLastTxHashes } =
    useAddressesLastTransactionHashes(addressHash)
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useAddressesAlphBalancesTotal(addressHash)
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const { data, isLoading } = useQueries({
    queries: latestAddressesTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressTokensBalanceQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine: (results) => ({
      data: results.reduce(
        (acc, { data }) => {
          data?.tokenBalances.map(({ id }) => {
            const listedFungibleToken = fungibleTokenList?.find((token) => token.id === id)
            const alreadyAddedToArray = acc.some((token) => token.id === listedFungibleToken?.id)

            if (listedFungibleToken && !alreadyAddedToArray) acc.push(listedFungibleToken)
          })
          return acc
        },
        // Include ALPH in the results
        (alphBalances.totalBalance > 0 ? [ALPH] : []) as ListedFT[]
      ),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    data,
    isLoading: isLoading || isLoadingFungibleTokenList || isLoadingLastTxHashes || isLoadingAlphBalances
  }
}

export const useAddressesListedFTsWithPrice = (addressHash?: AddressHash) => {
  const { data: tokens } = useAddressesListedFTs(addressHash)

  return useMemo(() => tokens.filter((token) => token.symbol in explorer.TokensWithPrice), [tokens])
}
