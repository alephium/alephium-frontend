import { AddressGroup } from '@alephium/walletconnect-provider'
import { createSelector } from '@reduxjs/toolkit'
import { partition } from 'lodash'

import { addressesAdapter } from '@/store/addresses/addressesAdapters'
import { SharedRootState } from '@/store/store'
import { AddressHash } from '@/types/addresses'

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<SharedRootState>((state) => state.addresses)

export const selectAllAddressHashes = createSelector(selectAddressIds, (addresses) => addresses as AddressHash[])

export const selectAllAddressIndexes = createSelector(selectAllAddresses, (addresses) => {
  const [addressesWithGroup, grouplessAddresses] = partition(
    addresses,
    ({ keyType }) => keyType === 'default' || keyType === 'bip340-schnorr'
  )

  return {
    indexesOfAddressesWithGroup: addressesWithGroup.map(({ index }) => index),
    indexesOfGrouplessAddresses: grouplessAddresses.map(({ index }) => index)
  }
})

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
