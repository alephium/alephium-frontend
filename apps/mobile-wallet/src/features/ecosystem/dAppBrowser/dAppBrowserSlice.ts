import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const sliceName = 'dAppBrowser'

const initialState = {
  isInEcosystemInAppBrowser: false
}

const dAppBrowserSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setIsInEcosystemInAppBrowser: (state, action: PayloadAction<boolean>) => {
      state.isInEcosystemInAppBrowser = action.payload
    }
  }
})

export const { setIsInEcosystemInAppBrowser } = dAppBrowserSlice.actions

export default dAppBrowserSlice
