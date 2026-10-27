import { addressDeleted, walletSwitchedMobile } from '@alephium/shared/store'
import { AddressHash } from '@alephium/shared/types'
import { createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { addressMigrated } from '~/features/addressMigration/addressMigrationActions'
import { DEFAULT_SWAP_SLIPPAGE } from '~/features/swap/swapConstants'
import { storeSwapSlippage } from '~/features/swap/swapPersistentStorage'

const sliceName = 'swap'

type SwapState = {
  slippage: number // fraction, e.g. 0.005 = 0.5%
  // Session-only (not persisted). Undefined = use the wallet default (see selectSwapFromAddressHash).
  fromAddressHash?: AddressHash
}

const initialState: SwapState = {
  slippage: DEFAULT_SWAP_SLIPPAGE,
  fromAddressHash: undefined
}

const swapSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    swapSlippageLoadedFromStorage: (state, action: PayloadAction<number>) => {
      state.slippage = action.payload
    },
    swapSlippageChanged: (state, action: PayloadAction<number>) => {
      state.slippage = action.payload
    },
    swapFromAddressChanged: (state, action: PayloadAction<AddressHash>) => {
      state.fromAddressHash = action.payload
    },
    swapFromAddressReset: (state) => {
      state.fromAddressHash = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addressMigrated, (state, { payload }) => {
        if (state.fromAddressHash === payload.fromAddressHash) state.fromAddressHash = payload.toAddressHash
      })
      .addCase(addressDeleted, (state, { payload: addressHash }) => {
        if (state.fromAddressHash === addressHash) state.fromAddressHash = undefined
      })
      .addCase(walletSwitchedMobile, (state) => {
        state.fromAddressHash = undefined
      })
  }
})

export default swapSlice

export const { swapSlippageLoadedFromStorage, swapSlippageChanged, swapFromAddressChanged, swapFromAddressReset } =
  swapSlice.actions

export const swapListenerMiddleware = createListenerMiddleware()

swapListenerMiddleware.startListening({
  actionCreator: swapSlippageChanged,
  effect: async (action) => {
    storeSwapSlippage(action.payload)
  }
})
