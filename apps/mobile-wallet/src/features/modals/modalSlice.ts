import { createSlice } from '@reduxjs/toolkit'

import { closeModal, openModal, removeModal } from '~/features/modals/modalActions'
import { modalAdapter } from '~/features/modals/modalAdapters'

const initialState = modalAdapter.getInitialState()
const { selectAll } = modalAdapter.getSelectors()

const modalSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(openModal, (state, action) => {
        modalAdapter.addOne(state, {
          id: Date.now(),
          params: action.payload,
          isClosing: false
        })
      })
      .addCase(closeModal, (state, { payload: { id, name } }) => {
        let modalId = id

        if (!modalId && name) {
          const allModals = selectAll(state)
          const modalWithName = allModals.find((modal) => modal.params.name === name)
          if (modalWithName) {
            modalId = modalWithName.id
          }
        }

        if (modalId) {
          modalAdapter.updateOne(state, {
            id: modalId,
            changes: {
              isClosing: true
            }
          })
        }
      })
      .addCase(removeModal, (state, { payload: { id } }) => {
        modalAdapter.removeOne(state, id)
      })
  }
})

export default modalSlice
