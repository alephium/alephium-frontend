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

import { RootState } from './store'

const sliceName = 'price'

type PriceStatus = 'uninitialized' | 'updating' | 'updated'

interface PriceState {
  value?: number
  status: PriceStatus
}

const initialState: PriceState = {
  value: undefined,
  status: 'uninitialized'
}

export const priceUpdated = createAsyncThunk(`${sliceName}/priceUpdated`, async (_, { dispatch, getState }) => {
  dispatch(statusChanged('updating'))

  const state = getState() as RootState
  const currency = state.settings.currency

  console.log(`⬇️ Fetching latest ${currency} price`)

  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=alephium&vs_currencies=${currency}`)
  const data = await response.json()
  const latestPrice = data.alephium[currency.toLowerCase()]

  return latestPrice
})

const priceSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    priceReset: (state) => initialState,
    statusChanged: (state, action: PayloadAction<PriceStatus>) => {
      state.status = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(priceUpdated.fulfilled, (state, action) => {
      const latestPrice = action.payload

      return {
        value: latestPrice,
        status: 'updated'
      }
    })
  }
})

export default priceSlice

export const { priceReset, statusChanged } = priceSlice.actions
