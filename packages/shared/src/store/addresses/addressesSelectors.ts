import { AddressGroup } from '@alephium/walletconnect-provider'
import { createSelector } from '@reduxjs/toolkit'

import { addressesAdapter } from '@/store/addresses/addressesAdapters'
import { SharedRootState } from '@/store/store'
import { AddressHash } from '@/types/addresses'

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<SharedRootState>((state) => state.addresses)

export const selectAllAddressHashes = createSelector(selectAddressIds, (addresses) => addresses as AddressHash[])

export const selectAllAddressIndexes = createSelector(selectAllAddresses, (addresses) =>
  addresses.map(({ index }) => index)
)

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
  (addresses) => addresses.find((address) => address.isDefault) || addresses.at(0)
)

export const selectDefaultAddressHash = createSelector(selectDefaultAddress, (address) => address?.hash)

export const selectInitialAddress = createSelector(selectAllAddresses, (addresses) =>
  addresses.find((address) => address.index === 0)
)

export const selectAddressesInGroup = createSelector(
  [selectAllAddresses, (_, group?: AddressGroup) => group],
  (addresses, group) =>
    (group !== undefined ? addresses.filter((address) => address.group === group) : addresses).map(({ hash }) => hash)
)
