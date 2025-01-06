import { createSlice } from '@reduxjs/toolkit'

import { openModal } from '~/features/modals/modalActions'

const initialState = {
  needsReminder: true
}

const backupSlice = createSlice({
  name: 'backup',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(openModal, (state, { payload: { name: modalName } }) => {
      if (modalName === 'BackupReminderModal') {
        state.needsReminder = false
      }
    })
  }
})

export default backupSlice
