import { appReset, hideToken, unhideToken } from '@alephium/shared'
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'

import { hiddenTokensStorage } from '@/features/hiddenTokens/hiddenTokensPersistentStorage'
import { RootState } from '@/storage/store'

const sliceName = 'hiddenTokens'

const hiddenTokensListenerMiddleware = createListenerMiddleware()

export default hiddenTokensListenerMiddleware

// When the settings change, store them in persistent storage
hiddenTokensListenerMiddleware.startListening({
  matcher: isAnyOf(hideToken, unhideToken, appReset),
  effect: (_, { getState }) => {
    const state = getState() as RootState
    const walletId = state.activeWallet.id
    const hiddenTokensState = state[sliceName]

    if (hiddenTokensState.loadedFromStorage && walletId) {
      try {
        hiddenTokensStorage.store(walletId, hiddenTokensState.hiddenTokensIds)
      } catch (error) {
        console.error(error)
      }
    }
  }
})
