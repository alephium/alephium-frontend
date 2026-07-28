import { activeWalletDeleted, appBecameInactive, appReset, walletSwitchedMobile } from '@alephium/shared/store'
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import { openModal } from '~/features/modals/modalActions'

// Not persisted on purpose: the reminder should reappear on a fresh launch, but not when the user
// merely backgrounds the app and returns.
const initialState = {
  remindedWalletIds: [] as string[],
  verifiedWordsCount: 0
}

const backupSlice = createSlice({
  name: 'backup',
  initialState,
  reducers: {
    verifiedWordsCountChanged: (state, { payload }: PayloadAction<number>) => {
      state.verifiedWordsCount = payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(openModal, (state, { payload }) => {
      if (payload.name === 'BackupReminderModal' && !state.remindedWalletIds.includes(payload.props.walletId)) {
        state.remindedWalletIds.push(payload.props.walletId)
      }
    })
    builder.addMatcher(isAnyOf(activeWalletDeleted, walletSwitchedMobile, appReset, appBecameInactive), (state) => {
      state.verifiedWordsCount = 0
    })
  }
})

export const { verifiedWordsCountChanged } = backupSlice.actions

export default backupSlice
