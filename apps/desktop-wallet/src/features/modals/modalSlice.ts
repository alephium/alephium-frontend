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
import { createSlice, isAnyOf } from '@reduxjs/toolkit'

import { closeModal, openModal } from '@/features/modals/modalActions'
import { modalAdapter } from '@/features/modals/modalAdapters'
import { AddressModalBaseProp, ModalInstance } from '@/features/modals/modalTypes'
import { addressDeleted } from '@/storage/addresses/addressesActions'
import { activeWalletDeleted, walletLocked, walletSwitched } from '@/storage/wallets/walletActions'

const initialState = modalAdapter.getInitialState()

const modalSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(openModal, (state, action) => {
        modalAdapter.addOne(state, {
          id: Date.now(),
          params: action.payload
        })
      })
      .addCase(closeModal, (state, { payload: { id } }) => {
        modalAdapter.removeOne(state, id)
      })
      .addCase(addressDeleted, (state, { payload: addressHash }) => {
        const openAddressModals = state.ids.filter(
          (id) => state.entities[id] && isAddressModalOpen(state.entities[id], addressHash)
        )

        modalAdapter.removeMany(state, openAddressModals)
      })

    builder.addMatcher(isAnyOf(walletSwitched, walletLocked, activeWalletDeleted), (state) => {
      modalAdapter.removeAll(state)
    })
  }
})

export default modalSlice

const isAddressModalOpen = (modalInstance: ModalInstance, addressHash: AddressHash) =>
  (modalInstance.params as { props: AddressModalBaseProp })?.props?.addressHash === addressHash
