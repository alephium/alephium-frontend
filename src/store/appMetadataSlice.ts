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

import { NavigationState } from '@react-navigation/routers'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const sliceName = 'appMetadata'

export interface AppMetadataState {
  lastNavigationState?: NavigationState
  isAppBackgroundedAcknowledged: boolean
}

const initialState: AppMetadataState = {
  lastNavigationState: undefined,
  isAppBackgroundedAcknowledged: true
}

const appMetadataSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    routeChanged: (state, action: PayloadAction<AppMetadataState['lastNavigationState']>) => ({
      ...state,
      lastNavigationState: action.payload
    }),
    appBackgroundedAcknowledged: (state, action: PayloadAction<AppMetadataState['isAppBackgroundedAcknowledged']>) => ({
      ...state,
      isAppBackgroundedAcknowledged: action.payload
    })
  }
})

export const { appBackgroundedAcknowledged, routeChanged } = appMetadataSlice.actions

export default appMetadataSlice
