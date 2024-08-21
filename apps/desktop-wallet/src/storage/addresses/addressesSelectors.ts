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

import {
  AddressHash,
  Asset,
  contactsAdapter,
  selectAllFungibleTokens,
  selectNFTIds,
  TokenDisplayBalances
} from '@alephium/shared'
import { AddressGroup } from '@alephium/walletconnect-provider'
import { createSelector } from '@reduxjs/toolkit'

import { addressesAdapter } from '@/storage/addresses/addressesAdapters'
import { RootState } from '@/storage/store'
import { Address } from '@/types/addresses'

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<RootState>((state) => state.addresses)

export const selectAllAddressHashes = createSelector(selectAddressIds, (addresses) => addresses as AddressHash[])

export const makeSelectAddresses = () =>
  createSelector(
    [selectAllAddresses, (_, addressHashes?: AddressHash[] | AddressHash) => addressHashes],
    (allAddresses, addressHashes) =>
      addressHashes
        ? allAddresses.filter((address) =>
            Array.isArray(addressHashes) ? addressHashes.includes(address.hash) : addressHashes === address.hash
          )
        : allAddresses
  )

export const selectDefaultAddress = createSelector(
  selectAllAddresses,
  (addresses) => addresses.find((address) => address.isDefault) || addresses[0]
)

export const makeSelectAddressesUnknownTokens = () =>
  createSelector(
    [selectAllFungibleTokens, selectNFTIds, makeSelectAddresses()],
    (fungibleTokens, nftIds, addresses): Asset[] => {
      const tokensWithoutMetadata = getAddressesTokenBalances(addresses).reduce((acc, token) => {
        const hasTokenMetadata = !!fungibleTokens.find((t) => t.id === token.id)
        const hasNFTMetadata = nftIds.includes(token.id)

        if (!hasTokenMetadata && !hasNFTMetadata) {
          acc.push({
            id: token.id,
            balance: BigInt(token.balance.toString()),
            lockedBalance: BigInt(token.lockedBalance.toString()),
            decimals: 0
          })
        }

        return acc
      }, [] as Asset[])

      return tokensWithoutMetadata
    }
  )

export const { selectAll: selectAllContacts } = contactsAdapter.getSelectors<RootState>((state) => state.contacts)

export const makeSelectContactByAddress = () =>
  createSelector([selectAllContacts, (_, addressHash) => addressHash], (contacts, addressHash) =>
    contacts.find((contact) => contact.address === addressHash)
  )

export const selectIsStateUninitialized = createSelector(
  (state: RootState) => state.addresses.status,
  (status) => status === 'uninitialized'
)

export const selectHaveAllPagesLoaded = createSelector(
  [selectAllAddresses, (state: RootState) => state.confirmedTransactions.allLoaded],
  (addresses, allTransactionsLoaded) =>
    addresses.every((address) => address.allTransactionPagesLoaded) || allTransactionsLoaded
)

const getAddressesTokenBalances = (addresses: Address[]) =>
  addresses.reduce((acc, { tokens }) => {
    tokens.forEach((token) => {
      const existingToken = acc.find((t) => t.id === token.tokenId)

      if (!existingToken) {
        acc.push({
          id: token.tokenId,
          balance: BigInt(token.balance),
          lockedBalance: BigInt(token.lockedBalance)
        })
      } else {
        existingToken.balance = existingToken.balance + BigInt(token.balance)
        existingToken.lockedBalance = existingToken.lockedBalance + BigInt(token.lockedBalance)
      }
    })

    return acc
  }, [] as TokenDisplayBalances[])

export const selectAddressesInGroup = createSelector(
  [selectAllAddresses, (_, group?: AddressGroup) => group],
  (addresses, group) =>
    (group !== undefined ? addresses.filter((address) => address.group === group) : addresses).map(({ hash }) => hash)
)
