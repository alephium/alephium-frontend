import { appReset, hideToken, unhideToken } from '@alephium/shared'
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'

import { storeHiddenTokensIds } from '~/features/assetsDisplay/hideTokens/hiddenTokensStorage'
import { RootState } from '~/store/store'

const sliceName = 'hiddenTokens'

const hiddenTokensListenerMiddleware = createListenerMiddleware()

export default hiddenTokensListenerMiddleware

// When the settings change, store them in persistent storage
hiddenTokensListenerMiddleware.startListening({
  matcher: isAnyOf(hideToken, unhideToken, appReset),
  effect: (_, { getState }) => {
    const state = (getState() as RootState)[sliceName]

    if (state.loadedFromStorage) storeHiddenTokensIds(state.hiddenTokensIds)
  }
})
