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

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { appReset } from './actions'
import { currencySelected } from './settingsSlice'
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

export const updatePrice = createAsyncThunk(`${sliceName}/updatePrice`, async (_, { dispatch, getState }) => {
  dispatch(priceUpdateStarted())

  const state = getState() as RootState
  const currency = state.settings.currency

  // TODO: move into /src/api
  console.log(`⬇️ Fetching latest ${currency} price`)

  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=alephium&vs_currencies=${currency}`)
  const data = await response.json()
  const latestPrice = data.alephium[currency.toLowerCase()]

  return latestPrice
})

const resetPrice = () => initialState

const priceSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    priceReset: resetPrice,
    priceUpdateStarted: (state) => {
      state.status = 'updating'
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updatePrice.fulfilled, (_, action) => ({
        value: action.payload,
        status: 'updated'
      }))
      .addCase(currencySelected, resetPrice)
      .addCase(appReset, resetPrice)
  }
})

export default priceSlice

export const { priceReset, priceUpdateStarted } = priceSlice.actions
