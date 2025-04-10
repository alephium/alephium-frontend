import { AddressHash, contactsAdapter } from '@alephium/shared'
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
