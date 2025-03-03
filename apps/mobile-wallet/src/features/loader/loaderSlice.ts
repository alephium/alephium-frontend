import { createSlice } from '@reduxjs/toolkit'

import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'

const sliceName = 'loader'

export interface AppMetadataState {
  loadingText: string
}

const initialState: AppMetadataState = {
  loadingText: ''
}

const loaderSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(activateAppLoading, (state, action) => {
        state.loadingText = action.payload
      })
      .addCase(deactivateAppLoading, (state) => {
        state.loadingText = ''
      })
  }
})

export default loaderSlice
