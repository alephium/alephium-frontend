import { appReset } from '@alephium/shared/store'
import { WalletListEntry } from '@alephium/shared/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const sliceName = 'wallets'

interface WalletsState {
  list: WalletListEntry[]
  loadedFromStorage: boolean
}

const initialState: WalletsState = {
  list: [],
  loadedFromStorage: false
}

const walletsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    walletListLoaded: (state, { payload }: PayloadAction<WalletListEntry[]>) => {
      state.list = payload
      state.loadedFromStorage = true
    },
    walletAddedToList: (state, { payload }: PayloadAction<WalletListEntry>) => {
      const existingIndex = state.list.findIndex((w) => w.id === payload.id)

      if (existingIndex >= 0) {
        state.list[existingIndex] = payload
      } else {
        state.list.push(payload)
      }
    },
    walletRenamedInList: (state, { payload }: PayloadAction<{ walletId: string; name: string }>) => {
      const wallet = state.list.find((w) => w.id === payload.walletId)

      if (wallet) {
        wallet.name = payload.name
      }
    },
    walletLastUsedUpdated: (state, { payload: walletId }: PayloadAction<string>) => {
      const wallet = state.list.find((w) => w.id === walletId)

      if (wallet) {
        wallet.lastUsed = Date.now()
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(appReset, () => initialState)
  }
})

export const { walletListLoaded, walletAddedToList, walletRenamedInList } = walletsSlice.actions

export default walletsSlice
