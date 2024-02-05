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
  AddressFungibleToken,
  AddressHash,
  Asset,
  calculateAmountWorth,
  NFT,
  TokenDisplayBalances
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { AddressGroup } from '@alephium/walletconnect-provider'
import { createSelector } from '@reduxjs/toolkit'
import { sortBy } from 'lodash'

import { addressesAdapter, contactsAdapter } from '@/storage/addresses/addressesAdapters'
import { selectAllFungibleTokens, selectAllNFTs, selectNFTIds } from '@/storage/assets/assetsSelectors'
import { selectAllPrices, selectAllPricesHistories } from '@/storage/prices/pricesSelectors'
import { RootState } from '@/storage/store'
import { Address } from '@/types/addresses'
import { filterAddressesWithoutAssets } from '@/utils/addresses'

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<RootState>((state) => state.addresses)

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

export const selectDefaultAddress = createSelector(selectAllAddresses, (addresses) =>
  addresses.find((address) => address.isDefault)
)

export const selectTotalBalance = createSelector([selectAllAddresses], (addresses) =>
  addresses.reduce((acc, address) => acc + BigInt(address.balance), BigInt(0))
)

export const makeSelectAddressesAlphAsset = () =>
  createSelector(makeSelectAddresses(), (addresses): Asset => {
    const alphBalances = addresses.reduce(
      (acc, { balance, lockedBalance }) => ({
        balance: acc.balance + BigInt(balance),
        lockedBalance: acc.lockedBalance + BigInt(lockedBalance)
      }),
      { balance: BigInt(0), lockedBalance: BigInt(0) }
    )

    return {
      ...ALPH,
      ...alphBalances,
      verified: true
    }
  })

export const makeSelectAddressesTokens = () =>
  createSelector(
    [selectAllFungibleTokens, selectAllNFTs, makeSelectAddressesAlphAsset(), makeSelectAddresses()],
    (fungibleTokens, nfts, alphAsset, addresses): Asset[] => {
      const tokens = getAddressesTokenBalances(addresses).reduce((acc, token) => {
        const fungibleToken = fungibleTokens.find((t) => t.id === token.id)
        const nftInfo = nfts.find((nft) => nft.id === token.id)

        acc.push({
          id: token.id,
          balance: BigInt(token.balance.toString()),
          lockedBalance: BigInt(token.lockedBalance.toString()),
          name: fungibleToken?.name ?? nftInfo?.name,
          symbol: fungibleToken?.symbol,
          description: fungibleToken?.description ?? nftInfo?.description,
          logoURI: fungibleToken?.logoURI ?? nftInfo?.image,
          decimals: fungibleToken?.decimals ?? 0,
          verified: fungibleToken?.verified
        })

        return acc
      }, [] as Asset[])

      return [
        alphAsset,
        ...sortBy(tokens, [(a) => !a.verified, (a) => a.verified === undefined, (a) => a.name?.toLowerCase(), 'id'])
      ]
    }
  )

export const makeSelectAddressesKnownFungibleTokens = () =>
  createSelector([makeSelectAddressesTokens()], (tokens): AddressFungibleToken[] =>
    tokens.filter((token): token is AddressFungibleToken => !!token.symbol)
  )

export const makeSelectAddressesVerifiedFungibleTokens = () =>
  createSelector([makeSelectAddressesTokens()], (tokens): AddressFungibleToken[] =>
    tokens.filter((token): token is AddressFungibleToken => !!token.verified)
  )

export const selectAllAddressVerifiedFungibleTokenSymbols = createSelector(
  [makeSelectAddressesVerifiedFungibleTokens(), selectAllPricesHistories],
  (verifiedFungibleTokens, histories) =>
    verifiedFungibleTokens
      .map((token) => token.symbol)
      .reduce(
        (acc, tokenSymbol) => {
          const tokenHistory = histories.find(({ symbol }) => symbol === tokenSymbol)

          if (!tokenHistory || tokenHistory.status === 'uninitialized') {
            acc.uninitialized.push(tokenSymbol)
          } else if (tokenHistory && tokenHistory.history.length > 0) {
            acc.withPriceHistory.push(tokenSymbol)
          }

          return acc
        },
        {
          uninitialized: [] as string[],
          withPriceHistory: [] as string[]
        }
      )
)

export const makeSelectAddressesTokensWorth = () =>
  createSelector([makeSelectAddressesKnownFungibleTokens(), selectAllPrices], (verifiedFungibleTokens, tokenPrices) =>
    tokenPrices.reduce((totalWorth, { symbol, price }) => {
      const verifiedFungibleToken = verifiedFungibleTokens.find((t) => t.symbol === symbol)

      return verifiedFungibleToken
        ? totalWorth + calculateAmountWorth(verifiedFungibleToken.balance, price, verifiedFungibleToken.decimals)
        : totalWorth
    }, 0)
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

export const makeSelectAddressesCheckedUnknownTokens = () =>
  createSelector(
    [makeSelectAddressesUnknownTokens(), (state: RootState) => state.fungibleTokens.checkedUnknownTokenIds],
    (tokensWithoutMetadata, checkedUnknownTokenIds) =>
      tokensWithoutMetadata.filter((token) => checkedUnknownTokenIds.includes(token.id))
  )

export const makeSelectAddressesNFTs = () =>
  createSelector([selectAllNFTs, makeSelectAddresses()], (nfts, addresses): NFT[] => {
    const addressesTokenIds = addresses.flatMap(({ tokens }) => tokens.map(({ tokenId }) => tokenId))

    return nfts.filter((nft) => addressesTokenIds.includes(nft.id))
  })

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

export const selectHaveHistoricBalancesLoaded = createSelector(selectAllAddresses, (addresses) =>
  addresses.every((address) => address.alphBalanceHistoryInitialized)
)

export const makeSelectAddressesHaveHistoricBalances = () =>
  createSelector(
    makeSelectAddresses(),
    (addresses) =>
      addresses.every((address) => address.alphBalanceHistoryInitialized) &&
      addresses.some((address) => address.alphBalanceHistory.ids.length > 0)
  )

export const selectAddressesWithSomeBalance = createSelector(selectAllAddresses, filterAddressesWithoutAssets)

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
  (addresses, group) => (group !== undefined ? addresses.filter((address) => address.group === group) : addresses)
)
