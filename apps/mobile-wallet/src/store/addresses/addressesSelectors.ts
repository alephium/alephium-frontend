import {
  AddressFungibleToken,
  AddressHash,
  Asset,
  calculateAmountWorth,
  calculateAssetsData,
  contactsAdapter,
  NFT,
  selectAllFungibleTokens,
  selectAllNFTs,
  selectAllPrices,
  selectNFTIds,
  sortAssets,
  TokenDisplayBalances
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { AddressGroup } from '@alephium/walletconnect-provider'
import { Token } from '@alephium/web3'
import { createSelector } from '@reduxjs/toolkit'

import { addressesAdapter } from '~/store/addresses/addressesAdaptor'
import { RootState } from '~/store/store'
import { Address } from '~/types/addresses'

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
      (state: RootState) => state.hiddenAssets.hiddenAssetsIds
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

export const makeSelectAddressesHiddenFungibleTokens = () =>
  createSelector(
    [makeSelectAddressesTokens(), (state: RootState) => state.hiddenAssets.hiddenAssetsIds],
    (tokens, hiddenAssetIds): Asset[] =>
      tokens.filter((token): token is AddressFungibleToken => hiddenAssetIds.includes(token.id))
  )

// Same as in desktop wallet
export const makeSelectAddressesUnknownTokensIds = () =>
  createSelector(
    [selectAllFungibleTokens, selectNFTIds, makeSelectAddresses()],
    (fungibleTokens, nftIds, addresses): Asset['id'][] => {
      const tokensWithoutMetadata = getAddressesTokenBalances(addresses).reduce(
        (acc, token) => {
          const hasTokenMetadata = !!fungibleTokens.find((t) => t.id === token.id)
          const hasNFTMetadata = nftIds.includes(token.id)

          if (!hasTokenMetadata && !hasNFTMetadata) {
            acc.push(token.id)
          }

          return acc
        },
        [] as Asset['id'][]
      )

      return tokensWithoutMetadata
    }
  )

// Same as in desktop wallet
export const makeSelectAddressesCheckedUnknownTokens = () =>
  createSelector(
    [makeSelectAddressesUnknownTokensIds(), (state: RootState) => state.app.checkedUnknownTokenIds],
    (tokensWithoutMetadata, checkedUnknownTokenIds) =>
      tokensWithoutMetadata.filter((tokenId) => checkedUnknownTokenIds.includes(tokenId))
  )

// Same as in desktop wallet
export const makeSelectAddressesNFTs = () =>
  createSelector([selectAllNFTs, makeSelectAddresses()], (nfts, addresses): NFT[] => {
    const addressesTokenIds = addresses.flatMap(({ tokens }) => tokens.map(({ tokenId }) => tokenId))

    return nfts.filter((nft) => addressesTokenIds.includes(nft.id))
  })

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
  (addresses) => addresses.find((address) => address.settings.isDefault) || addresses[0]
)

export const selectTotalBalance = createSelector([selectAllAddresses], (addresses) =>
  addresses.reduce((acc, address) => acc + BigInt(address.balance), BigInt(0))
)

export const makeSelectAddressesVerifiedFungibleTokens = () =>
  createSelector([makeSelectAddressesTokens()], (tokens): AddressFungibleToken[] =>
    tokens.filter((token): token is AddressFungibleToken => !!token.verified)
  )

export const selectAllAddressVerifiedFungibleTokenSymbols = createSelector(
  makeSelectAddressesVerifiedFungibleTokens(),
  (verifiedFungibleTokens) => verifiedFungibleTokens.map((token) => token.symbol)
)

export const selectAddressHiddenAssetIds = createSelector(
  [
    (state: RootState) => state.hiddenAssets.hiddenAssetsIds,
    (_, addressHash: AddressHash) => addressHash,
    (state: RootState) => state
  ],
  (hiddenAssetsIds, addressHash, state) => {
    const address = selectAddressByHash(state, addressHash)

    return hiddenAssetsIds.filter((id) => address?.tokens.some(({ tokenId }) => tokenId === id))
  }
)

export const selectAddressesInGroup = createSelector(
  [selectAllAddresses, (_, group?: AddressGroup) => group],
  (addresses, group) => (group !== undefined ? addresses.filter((address) => address.group === group) : addresses)
)

export const selectContactByHash = createSelector(
  [selectAllContacts, (_, addressHash: AddressHash) => addressHash],
  (contacts, addressHash) => contacts.find((contact) => contact.address === addressHash)
)

// Same as in desktop wallet
export const makeSelectAddressesTokensWorth = () =>
  createSelector([makeSelectAddressesKnownFungibleTokens(), selectAllPrices], (verifiedFungibleTokens, tokenPrices) =>
    tokenPrices.reduce((totalWorth, { symbol, price }) => {
      const verifiedFungibleToken = verifiedFungibleTokens.find((t) => t.symbol === symbol)

      return verifiedFungibleToken
        ? totalWorth + calculateAmountWorth(verifiedFungibleToken.balance, price, verifiedFungibleToken.decimals)
        : totalWorth
    }, 0)
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
