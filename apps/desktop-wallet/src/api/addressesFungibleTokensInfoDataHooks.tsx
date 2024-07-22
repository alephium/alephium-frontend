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
import { ALPH, TokenInfo } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { addressTokensBalanceQuery } from '@/api/addressQueries'
import { useAddressesLastTransactionHashes } from '@/api/addressTransactionsDataHooks'
import { useFungibleTokenList } from '@/api/fungibleTokenListDataHooks'
import { useAppSelector } from '@/hooks/redux'

export const useAddressesListedFungibleTokens = (addressHash?: AddressHash) => {
  const { data: fungibleTokenList } = useFungibleTokenList()
  const { data: latestAddressesTxHashes } = useAddressesLastTransactionHashes(addressHash)
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const { data, isLoading } = useQueries({
    queries: latestAddressesTxHashes.map(({ addressHash, latestTxHash }) =>
      addressTokensBalanceQuery({ addressHash, latestTxHash, networkId })
    ),
    combine: (results) => ({
      data: results.reduce(
        (acc, { data }) => {
          data?.map(({ tokenId }) => {
            const listedFungibleToken = fungibleTokenList?.find((token) => token.id === tokenId)
            const alreadyAddedToArray = acc.some((token) => token.id === listedFungibleToken?.id)

            if (listedFungibleToken && !alreadyAddedToArray) acc.push(listedFungibleToken)
          })
          return acc
        },
        // Include ALPH in the results
        [ALPH] as TokenInfo[]
      ),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    data,
    isLoading
  }
}

export const useAddressesListedFungibleTokensWithPrice = (addressHash?: AddressHash) => {
  const { data: tokens } = useAddressesListedFungibleTokens(addressHash)

  return useMemo(() => tokens.filter((token) => token.symbol in explorer.TokensWithPrice), [tokens])
}
