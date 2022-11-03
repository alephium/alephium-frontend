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

import { createNavigationContainerRef } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback } from 'react'

import { useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'

export const rootStackNavigationRef = createNavigationContainerRef<RootStackParamList>()

export const useRestoreNavigationState = () => {
  const lastNavigationState = useAppSelector((state) => state.appMetadata.lastNavigationState)

  const restoreNavigationState = useCallback(
    (reset?: boolean) => {
      const resetNavigationState = reset || !lastNavigationState

      rootStackNavigationRef.resetRoot(
        resetNavigationState ? { index: 0, routes: [{ name: 'InWalletScreen' }] } : lastNavigationState
      )
    },
    [lastNavigationState]
  )

  return restoreNavigationState
}

// Navigating without the navigation prop:
// https://reactnavigation.org/docs/navigating-without-navigation-prop
export const navigateRootStack = (
  name: keyof RootStackParamList,
  params?: StackScreenProps<RootStackParamList>['route']['params']
) => {
  if (rootStackNavigationRef.isReady()) {
    rootStackNavigationRef.navigate(name, params)
  }
}
