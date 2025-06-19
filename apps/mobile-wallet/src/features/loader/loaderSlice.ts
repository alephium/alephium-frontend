import { createSlice } from '@reduxjs/toolkit'

import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { LoaderConfig } from '~/features/loader/loaderTypes'

const sliceName = 'loader'

const initialState: LoaderConfig = {
  text: ''
}

const loaderSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(activateAppLoading, (_, action) =>
        typeof action.payload === 'string' ? { text: action.payload } : action.payload
      )
      .addCase(deactivateAppLoading, () => initialState)
  }
})

export default loaderSlice
