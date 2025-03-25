import { createSelector } from '@reduxjs/toolkit'

import { RootState } from '@/storage/store'

export const selectIsWalletUnlocked = createSelector(
  [(state: RootState) => state.activeWallet.id, (state: RootState) => state.addresses.ids.length],
  (activeWalletId, addressesLength) => !!activeWalletId && addressesLength > 0
)
