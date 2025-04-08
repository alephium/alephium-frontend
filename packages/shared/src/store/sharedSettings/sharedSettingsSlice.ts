import { createSlice } from '@reduxjs/toolkit'

import { fiatCurrencyChanged, storedSharedSettingsLoaded } from '@/store/sharedSettings/sharedSettingsActions'
import { SharedSettings } from '@/types/sharedSettings'

const initialState: SharedSettings = {
  fiatCurrency: 'USD'
}

const sharedSettingsSlice = createSlice({
  name: 'sharedSettings',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(storedSharedSettingsLoaded, (_, { payload: sharedSettings }) => sharedSettings)
      .addCase(fiatCurrencyChanged, (state, action) => {
        state.fiatCurrency = action.payload
      })
  }
})

export default sharedSettingsSlice
