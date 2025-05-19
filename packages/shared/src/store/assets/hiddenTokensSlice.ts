import { createSlice } from '@reduxjs/toolkit'

import { hiddenTokensLoadedFromStorage, hideToken, unhideToken } from '@/store/assets/hiddenTokensActions'
import { appReset } from '@/store/global'
import { HiddenTokensState } from '@/types/assets'

const sliceName = 'hiddenTokens'

const initialState: HiddenTokensState = {
  hiddenTokensIds: [],
  loadedFromStorage: false
}

const resetState = () => initialState

const hiddenTokensSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(hiddenTokensLoadedFromStorage, (state, action) => {
        state.hiddenTokensIds = action.payload
        state.loadedFromStorage = true
      })
      .addCase(hideToken, (state, action) => {
        if (!state.hiddenTokensIds.includes(action.payload)) {
          state.hiddenTokensIds.push(action.payload)
        }
      })
      .addCase(unhideToken, (state, action) => {
        state.hiddenTokensIds = state.hiddenTokensIds.filter((id) => id !== action.payload)
      })
      .addCase(appReset, resetState)
  }
})

export default hiddenTokensSlice
