import {
  AddressFungibleToken,
  AddressHash,
  Asset,
  calculateAssetsData,
  contactsAdapter,
  DEPRECATED_Address as Address,
  selectAllFungibleTokens,
  selectAllNFTs,
  selectAllPrices,
  sortAssets,
  TokenDisplayBalances
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { AddressGroup } from '@alephium/walletconnect-provider'
import { Token } from '@alephium/web3'
import { createSelector } from '@reduxjs/toolkit'

import { addressesAdapter } from '~/store/addresses/addressesAdaptor'
import { RootState } from '~/store/store'

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<RootState>((state) => state.addresses)

// Same as in desktop wallet
export const { selectAll: selectAllContacts, selectById: selectContactById } = contactsAdapter.getSelectors<RootState>(
  (state) => state.contacts
)

// Same as in desktop wallet
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
    [
      selectAllFungibleTokens,
      selectAllNFTs,
      makeSelectAddressesAlphAsset(),
      makeSelectAddresses(),
      selectAllPrices,
      (_state: RootState, _addressHash?: AddressHash | AddressHash[], filterHiddenTokens?: boolean) =>
        filterHiddenTokens ?? false,
      (state: RootState) => state.hiddenTokens.hiddenTokensIds
    ],
    (fungibleTokens, nfts, alphAsset, addresses, tokenPrices, filterHiddenTokens, hiddenAssetIds): Asset[] => {
      const tokenBalances = getAddressesTokenBalances(addresses)

      if (alphAsset.balance > BigInt(0)) {
        tokenBalances.push(alphAsset)
      }

      const tokens = calculateAssetsData(tokenBalances, fungibleTokens, nfts, tokenPrices)

      return sortAssets(filterHiddenTokens ? tokens.filter((t) => !hiddenAssetIds.includes(t.id)) : tokens)
    }
  )

// Same as in desktop wallet
export const makeSelectAddressesKnownFungibleTokens = () =>
  createSelector(makeSelectAddressesTokens(), (tokens): AddressFungibleToken[] =>
    tokens.filter((token): token is AddressFungibleToken => !!token.symbol)
  )

export const makeSelectAddressesUnknownTokens = () =>
  createSelector([makeSelectAddressesTokens()], (tokens): Asset[] =>
    tokens.filter((token): token is Asset => !token.name && !token.symbol && !token.verified && !token.logoURI)
  )

// Same as in desktop wallet
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

export const selectTotalBalance = createSelector([selectAllAddresses], (addresses) =>
  addresses.reduce((acc, address) => acc + BigInt(address.balance), BigInt(0))
)

export const selectAddressesInGroup = createSelector(
  [selectAllAddresses, (_, group?: AddressGroup) => group],
  (addresses, group) => (group !== undefined ? addresses.filter((address) => address.group === group) : addresses)
)

export const selectContactByHash = createSelector(
  [selectAllContacts, (_, addressHash: AddressHash) => addressHash],
  (contacts, addressHash) => contacts.find((contact) => contact.address === addressHash)
)

export const selectAddressesWithToken = createSelector(
  [selectAllAddresses, (_, tokenId: Token['id']) => tokenId],
  (addresses, tokenId) =>
    tokenId === ALPH.id
      ? addresses.filter((address) => BigInt(address.balance) > 0)
      : addresses.filter((address) => address.tokens.find((token) => token.tokenId === tokenId))
)

// Same as in desktop wallet
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
