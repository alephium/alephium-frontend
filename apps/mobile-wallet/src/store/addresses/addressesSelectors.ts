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

import { AddressHash } from '@alephium/shared'
import { AddressGroup } from '@alephium/walletconnect-provider'
import { createSelector } from '@reduxjs/toolkit'

import { contactsAdapter } from '~/store/addresses/addressesAdapter'
import { selectAllAddresses } from '~/store/addressesSlice'
import { RootState } from '~/store/store'

// TODO: Same as in desktop wallet
export const selectHaveHistoricBalancesLoaded = createSelector(selectAllAddresses, (addresses) =>
  addresses.every((address) => address.balanceHistoryInitialized)
)

export const selectAddressesHaveHistoricBalances = createSelector(
  selectAllAddresses,
  (addresses) =>
    addresses.every((address) => address.balanceHistoryInitialized) &&
    addresses.some((address) => address.balanceHistory.ids.length > 0)
)

// TODO: Same as in desktop wallet
export const selectIsStateUninitialized = createSelector(
  (state: RootState) => state.addresses.status,
  (status) => status === 'uninitialized'
)

// TODO: Same as in desktop wallet
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
