import { createSelector } from '@reduxjs/toolkit'

import { RootState } from '@/storage/store'

// If the wallet is using Ledger, we don't want to use a password
export const selectEffectivePasswordRequirement = createSelector(
  [(state: RootState) => state.activeWallet.isLedger, (state: RootState) => state.settings.passwordRequirement],
  (isLedger, passwordRequirement) => (isLedger ? false : passwordRequirement)
)
