import { createSlice } from '@reduxjs/toolkit'

import { closeAllModals, closeModal, openModal, removeModal } from '~/features/modals/modalActions'
import { modalAdapter } from '~/features/modals/modalAdapters'

const initialState = modalAdapter.getInitialState()

const modalSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(openModal, (state, action) => {
        modalAdapter.addOne(state, {
          id: Date.now().toString(),
          params: action.payload,
          isClosing: false
        })
      })
      .addCase(closeModal, (state, { payload: { id } }) => {
        modalAdapter.updateOne(state, {
          id,
          changes: {
            isClosing: true
          }
        })
      })
      .addCase(removeModal, (state, { payload: { id } }) => {
        modalAdapter.removeOne(state, id)
      })
      .addCase(closeAllModals, (state) => {
        modalAdapter.updateMany(
          state,
          state.ids.map((id) => ({
            id,
            changes: {
              isClosing: true
            }
          }))
        )
      })
  }
})

export default modalSlice
