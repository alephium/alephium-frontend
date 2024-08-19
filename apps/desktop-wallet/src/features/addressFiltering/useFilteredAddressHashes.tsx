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
import { useQueries } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { useAddressesUnlistedFungibleTokens } from '@/api/addressesUnlistedTokensHooks'
import { addressAlphBalanceQuery, addressTokensBalanceQuery } from '@/api/addressQueries'
import { useAddressesLastTransactionHashes } from '@/api/addressTransactionsDataHooks'
import { useFungibleTokenList } from '@/api/fungibleTokenListDataHooks'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddresses, selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'
import { isDefined } from '@/utils/misc'

const useFilteredAddressHashes = (searchString = '', hideEmpty?: boolean) => {
  const allAddresses = useAppSelector(selectAllAddresses)
  const allAddressHashes = useAppSelector(selectAllAddressHashes)
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const { data: latestTxHashes } = useAddressesLastTransactionHashes()
  const { data: fungibleTokenList } = useFungibleTokenList()
  const { data: unlistedFungibleTokens } = useAddressesUnlistedFungibleTokens()

  const [filteredAddressHashes, setFilteredAddressHashes] = useState<AddressHash[]>()

  const { data: addressesAlphBalances } = useQueries({
    queries: latestTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressAlphBalanceQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine: (results) => ({ data: results.map(({ data }) => data).filter(isDefined) })
  })

  const { data: addressesTokensBalances } = useQueries({
    queries: latestTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressTokensBalanceQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine: (results) => ({ data: results.map(({ data }) => data).filter(isDefined) })
  })

  useEffect(() => {
    const filteredByText =
      searchString.length < 2
        ? allAddressHashes
        : allAddressHashes.filter((addressHash) => {
            const address = allAddresses.find((address) => address.hash === addressHash)
            const addressAlphBalances = addressesAlphBalances.find((address) => address.addressHash === addressHash)
            const addressHasAlphBalances = addressAlphBalances?.balances.balance !== '0'
            const addressTokensBalances = addressesTokensBalances.find((address) => address.addressHash === addressHash)
            const addressTokenNamesWithBalance = addressTokensBalances?.tokenBalances
              .filter(({ balance }) => balance !== '0')
              .map(({ tokenId }) => {
                const listedFungibleToken = fungibleTokenList?.find(({ id }) => id === tokenId)
                const unlistedFungibleToken = unlistedFungibleTokens?.find(({ id }) => id === tokenId)

                return listedFungibleToken
                  ? `${listedFungibleToken.name} ${listedFungibleToken.symbol} ${tokenId}`
                  : unlistedFungibleToken
                    ? `${unlistedFungibleToken.name} ${unlistedFungibleToken.symbol} ${tokenId}`
                    : tokenId
              })
              .join(' ')

            const addressAssetNamesWithBalances = `${addressHasAlphBalances ? 'Alephium ALPH ' : ''}${
              addressTokenNamesWithBalance ?? ''
            }`.toLowerCase()

            return (
              address &&
              (address.label?.toLowerCase().includes(searchString) ||
                address.hash.toLowerCase().includes(searchString) ||
                addressAssetNamesWithBalances.includes(searchString))
            )
          })

    const filteredByToggle = hideEmpty
      ? filteredByText.filter(
          (addressHash) =>
            addressesAlphBalances.find((address) => address.addressHash === addressHash)?.balances.balance !== '0'
        )
      : filteredByText

    setFilteredAddressHashes(filteredByToggle)
  }, [
    addressesAlphBalances,
    addressesTokensBalances,
    allAddressHashes,
    allAddresses,
    fungibleTokenList,
    hideEmpty,
    searchString,
    unlistedFungibleTokens
  ])

  return filteredAddressHashes
}

export default useFilteredAddressHashes
