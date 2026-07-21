import { createSlice } from '@reduxjs/toolkit'

import { openModal } from '~/features/modals/modalActions'

// Not persisted on purpose: the reminder should reappear on a fresh launch, but not when the user
// merely backgrounds the app and returns.
const initialState = {
  remindedWalletIds: [] as string[]
}

const backupSlice = createSlice({
  name: 'backup',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(openModal, (state, { payload }) => {
      if (payload.name === 'BackupReminderModal' && !state.remindedWalletIds.includes(payload.props.walletId)) {
        state.remindedWalletIds.push(payload.props.walletId)
      }
    })
  }
})

export default backupSlice
