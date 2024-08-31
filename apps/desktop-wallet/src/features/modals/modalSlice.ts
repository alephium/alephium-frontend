/*
Copyright 2018 - 2024 The Alephium Authors
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

import { createSlice } from '@reduxjs/toolkit'

import { closeModal, openModal } from '@/features/modals/modalActions'
import { ModalName, ModalsState } from '@/features/modals/modalTypes'

const createInitialModalState = (): ModalsState =>
  Object.values(ModalName).reduce(
    (state, key) => ({
      ...state,
      [key]: {
        isOpen: false,
        initialState: undefined
      }
    }),
    {} as ModalsState
  )

const initialModalsState: ModalsState = createInitialModalState()

const modalSlice = createSlice({
  name: 'modals',
  initialState: initialModalsState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(openModal, (state, action) => {
        const { name, initialState } = action.payload
        state[name].isOpen = true
        state[name].initialState = initialState
      })
      .addCase(closeModal, (state, action) => {
        const { name } = action.payload
        state[name].isOpen = false
        state[name].initialState = undefined
      })
  }
})

export default modalSlice
