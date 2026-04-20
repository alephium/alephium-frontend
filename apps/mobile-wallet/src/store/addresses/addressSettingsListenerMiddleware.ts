import { addressSettingsSaved, selectAddressByHash, selectDefaultAddress } from '@alephium/shared'
import { createListenerMiddleware } from '@reduxjs/toolkit'

import { RootState } from '~/store/store'
import { persistAddressesSettings } from '~/utils/addresses'

const addressSettingsListenerMiddleware = createListenerMiddleware()

export default addressSettingsListenerMiddleware

addressSettingsListenerMiddleware.startListening({
  actionCreator: addressSettingsSaved,
  effect: async (action, { getOriginalState, getState }) => {
    const state = getState() as RootState
    const originalState = getOriginalState() as RootState

    const walletId = state.wallet.id
    const { addressHash } = action.payload

    const address = selectAddressByHash(state, addressHash)
    if (!address) return

    const oldDefaultAddress = selectDefaultAddress(originalState)

    await persistAddressesSettings([address], walletId, oldDefaultAddress)
  }
})
