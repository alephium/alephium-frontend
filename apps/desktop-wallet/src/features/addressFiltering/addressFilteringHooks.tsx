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
import { useEffect, useMemo, useState } from 'react'

import { useAddressesUnlistedFTs } from '@/api/addressesUnlistedTokensHooks'
import useAddressesAlphBalances from '@/api/apiDataHooks/useAddressesAlphBalances'
import useAddressesTokensBalances from '@/api/apiDataHooks/useAddressesTokensBalances'
import { useFungibleTokenList } from '@/api/fungibleTokenListDataHooks'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddresses, selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'

export const useFilterAddressesByText = (text = '') => {
  const allAddresses = useAppSelector(selectAllAddresses)
  const allAddressHashes = useAppSelector(selectAllAddressHashes)
  const { data: fungibleTokenList } = useFungibleTokenList()
  const { data: unlistedFungibleTokens } = useAddressesUnlistedFTs()
  const { data: addressesAlphBalances } = useAddressesAlphBalances()
  const { data: addressesTokensBalances } = useAddressesTokensBalances()

  const [filteredAddressHashes, setFilteredAddressHashes] = useState<AddressHash[]>()

  useEffect(() => {
    setFilteredAddressHashes(
      text.length < 2
        ? allAddressHashes
        : allAddressHashes.filter((addressHash) => {
            const address = allAddresses.find((address) => address.hash === addressHash)
            const addressAlphBalances = addressesAlphBalances[addressHash]
            const addressHasAlphBalances = addressAlphBalances?.totalBalance !== BigInt(0)
            const addressTokensBalances = addressesTokensBalances[addressHash] ?? []
            const addressTokenNamesWithBalance = addressTokensBalances
              .filter(({ totalBalance }) => totalBalance !== BigInt(0))
              .map(({ id }) => {
                const listedFungibleToken = fungibleTokenList?.find((token) => token.id === id)
                const unlistedFungibleToken = unlistedFungibleTokens?.find((token) => token.id === id)

                return listedFungibleToken
                  ? `${listedFungibleToken.name} ${listedFungibleToken.symbol} ${id}`
                  : unlistedFungibleToken
                    ? `${unlistedFungibleToken.name} ${unlistedFungibleToken.symbol} ${id}`
                    : id
              })
              .join(' ')

            const addressAssetNamesWithBalances = `${addressHasAlphBalances ? 'Alephium ALPH ' : ''}${
              addressTokenNamesWithBalance ?? ''
            }`.toLowerCase()

            return (
              address &&
              (address.label?.toLowerCase().includes(text) ||
                address.hash.toLowerCase().includes(text) ||
                addressAssetNamesWithBalances.includes(text))
            )
          })
    )
  }, [
    addressesAlphBalances,
    addressesTokensBalances,
    allAddressHashes,
    allAddresses,
    fungibleTokenList,
    text,
    unlistedFungibleTokens
  ])

  return filteredAddressHashes
}

export const useAddressesWithBalance = () => {
  const allAddressHashes = useAppSelector(selectAllAddressHashes)
  const { data: addressesAlphBalances } = useAddressesAlphBalances()

  const filteredAddressHashes = useMemo(
    () =>
      allAddressHashes.filter(
        (addressHash) => addressesAlphBalances[addressHash] && addressesAlphBalances[addressHash].totalBalance > 0
      ),
    [addressesAlphBalances, allAddressHashes]
  )

  return filteredAddressHashes
}
