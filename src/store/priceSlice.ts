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

import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'

import { fetchLatestPrice } from '../api/price'
import { selectTotalBalance } from './addressesSlice'
import { appReset } from './appSlice'
import { currencySelected } from './settingsSlice'
import { RootState } from './store'

const sliceName = 'price'

type PriceStatus = 'uninitialized' | 'updating' | 'updated'

interface PriceState {
  value?: number
  status: PriceStatus
}

const initialState: PriceState = {
  value: 0,
  status: 'uninitialized'
}

export const updatePrice = createAsyncThunk(`${sliceName}/updatePrice`, async (_, { dispatch, getState }) => {
  dispatch(priceUpdateStarted())

  const state = getState() as RootState

  return await fetchLatestPrice(state.settings.currency)
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

export const selectIsPriceUninitialized = createSelector(
  [(state: RootState) => state.price.status, selectTotalBalance],
  (priceStatus, totalBalance) => priceStatus === 'uninitialized' && totalBalance > BigInt(0)
)

export default priceSlice

export const { priceReset, priceUpdateStarted } = priceSlice.actions
