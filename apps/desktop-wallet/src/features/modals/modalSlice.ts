import { activeWalletDeleted, AddressHash, walletLocked, walletSwitchedDesktop } from '@alephium/shared'
import { createSlice, isAnyOf } from '@reduxjs/toolkit'

import { closeModal, openModal } from '@/features/modals/modalActions'
import { modalAdapter } from '@/features/modals/modalAdapters'
import { AddressModalBaseProp, ModalInstance } from '@/features/modals/modalTypes'
import { addressDeleted } from '@/storage/addresses/addressesActions'

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

    builder.addMatcher(isAnyOf(walletSwitchedDesktop, walletLocked, activeWalletDeleted), (state) => {
      modalAdapter.removeAll(state)
    })
  }
})

export default modalSlice

const isAddressModalOpen = (modalInstance: ModalInstance, addressHash: AddressHash) =>
  (modalInstance.params as { props: AddressModalBaseProp })?.props?.addressHash === addressHash
