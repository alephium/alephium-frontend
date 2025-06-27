import { AddressGroup } from '@alephium/walletconnect-provider'
import { createSelector } from '@reduxjs/toolkit'
import { partition } from 'lodash'

import { addressesAdapter } from '@/store/addresses/addressesAdapters'
import { SharedRootState } from '@/store/store'
import { AddressHash } from '@/types/addresses'
import { isGrouplessAddress } from '@/utils/addresses'

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<SharedRootState>((state) => state.addresses)

export const selectAllAddressHashes = createSelector(selectAddressIds, (addresses) => addresses as AddressHash[])

export const selectAllAddressByType = createSelector(selectAllAddresses, (addresses) => {
  const [grouplessAddresses, addressesWithGroup] = partition(addresses, isGrouplessAddress)

  return {
    addressesWithGroup,
    grouplessAddresses
  }
})

export const selectAllAddressIndexes = createSelector(
  selectAllAddressByType,
  ({ addressesWithGroup, grouplessAddresses }) => ({
    indexesOfAddressesWithGroup: addressesWithGroup.map(({ index }) => index),
    indexesOfGrouplessAddresses: grouplessAddresses.map(({ index }) => index)
  })
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
    group !== undefined
      ? addresses.filter((address) => isGrouplessAddress(address) || address.group === group)
      : addresses
)

export const selectAddressesStrsInGroup = createSelector(selectAddressesInGroup, (addresses) =>
  addresses.map(({ hash }) => hash)
)

export const selectAddressGroup = createSelector(selectAddressByHash, (address) =>
  address === undefined || isGrouplessAddress(address) ? undefined : address.group
)
