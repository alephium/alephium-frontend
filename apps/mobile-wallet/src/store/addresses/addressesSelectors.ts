import { AddressHash, calculateAmountWorth, contactsAdapter, selectAllPrices } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { AddressGroup } from '@alephium/walletconnect-provider'
import { Token } from '@alephium/web3'
import { createSelector } from '@reduxjs/toolkit'

import { makeSelectAddressesKnownFungibleTokens, selectAllAddresses } from '~/store/addressesSlice'
import { RootState } from '~/store/store'

// Same as in desktop wallet
export const { selectAll: selectAllContacts, selectById: selectContactById } = contactsAdapter.getSelectors<RootState>(
  (state) => state.contacts
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
