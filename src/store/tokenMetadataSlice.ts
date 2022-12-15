/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenMetadata } from '../types/tokens'
import { appReset } from './actions'

const sliceName = 'tokenMetadata'

type TokenMetadataStatus = 'uninitialized' | 'updating' | 'updated'

interface TokenMetadataState {
  metadata: { [key: string]: TokenMetadata }
  status: TokenMetadataStatus
}

const initialState: TokenMetadataState = {
  metadata: {},
  status: 'uninitialized'
}

export const tokenMetadataUpdated = createAsyncThunk(`${sliceName}/tokenMetadataUpdated`, async (_, { dispatch }) => {
  console.log('⬇️ Fetching latest token metadata')

  dispatch(statusChanged('updating'))

  // TODO: Use official Alephium tokens-meta repo
  const response = await fetch('https://raw.githubusercontent.com/nop33/token-meta/master/tokens.json')

  return await response.json()
})

const tokenMetadataSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    statusChanged: (state, action: PayloadAction<TokenMetadataStatus>) => {
      state.status = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(tokenMetadataUpdated.fulfilled, (_, action) => ({
        metadata: action.payload,
        status: 'updated'
      }))
      .addCase(appReset, () => initialState)
  }
})

export default tokenMetadataSlice

export const { statusChanged } = tokenMetadataSlice.actions
