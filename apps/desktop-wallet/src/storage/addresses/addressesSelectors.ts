import { AddressHash, contactsAdapter } from '@alephium/shared'
import { AddressGroup } from '@alephium/walletconnect-provider'
import { createSelector } from '@reduxjs/toolkit'

import { addressesAdapter } from '@/storage/addresses/addressesAdapters'
import { RootState } from '@/storage/store'
import { AddressOrder } from '@/types/addresses.ts'

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

export const selectInitialAddress = createSelector(selectAllAddresses, (addresses) =>
  addresses.find((address) => address.index === 0)
)

export const { selectAll: selectAllContacts } = contactsAdapter.getSelectors<RootState>((state) => state.contacts)

export const makeSelectContactByAddress = () =>
  createSelector([selectAllContacts, (_, addressHash) => addressHash], (contacts, addressHash) =>
    contacts.find((contact) => contact.address === addressHash)
  )

export const selectAddressesInGroup = createSelector(
  [selectAllAddresses, (_, group?: AddressGroup) => group],
  (addresses, group) =>
    (group !== undefined ? addresses.filter((address) => address.group === group) : addresses).map(({ hash }) => hash)
)
export const selectSortedAddresses = createSelector(
  [
    (state: RootState) => state.addresses,
    (_, addresses: string[]) => addresses,
    (state: RootState) => state.activeWallet.id
  ],
  (addressesState, addressesToSort, walletId) => {
    if (!walletId) return addressesToSort

    const currentOrder = addressesState.orderPreference[walletId] ?? AddressOrder.LastUse

    return [...addressesToSort].sort((a, b) => {
      const addressA = addressesState.entities[a]
      const addressB = addressesState.entities[b]

      if (!addressA || !addressB) return 0

      switch (currentOrder) {
        case AddressOrder.Alphabetical: {
          // Default address always comes first
          if (addressA.isDefault && !addressB.isDefault) return -1
          if (!addressA.isDefault && addressB.isDefault) return 1

          // Then check for labels
          if (addressA.label && !addressB.label) return -1
          if (!addressA.label && addressB.label) return 1

          // Finally sort alphabetically
          const labelA = (addressA.label || addressA.hash).toLowerCase()
          const labelB = (addressB.label || addressB.hash).toLowerCase()
          return labelA.localeCompare(labelB)
        }
        case AddressOrder.LastUse:
          return 0 // Keep original order since it's already sorted by last used

        case AddressOrder.TotalValue: {
          // // Default address always comes first
          // if (addressA.isDefault && !addressB.isDefault) return -1
          // if (!addressA.isDefault && addressB.isDefault) return 1
          // // Finally sort by address worth
          // const worthA = addressWorthMap[addressA.hash] || 0
          // const worthB = addressWorthMap[addressB.hash] || 0
          // return worthB - worthA
          return 0
        }
        default:
          return 0
      }
    })
  }
)
