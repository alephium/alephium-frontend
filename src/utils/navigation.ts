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
import { NavigationState } from '@react-navigation/routers'

import RootStackParamList from '~/navigation/rootStackRoutes'
import { SendNavigationParamList } from '~/navigation/SendNavigation'

const getInitialNavigationState = (initialRouteName?: string) => ({
  index: 0,
  routes: [
    {
      name: initialRouteName || 'InWalletTabsNavigation'
    }
  ]
})

// To avoid circular imports, the navigator ref is defined and exported here instead of the RootStackNavigation.tsx file
// since the following util functions (that are used in screens imported by the RootStackNavigation) need the ref as
// well as the RootStackNavigation itself.
export const rootStackNavigationRef = createNavigationContainerRef<RootStackParamList>()

const excludedRoutesFromRestoring = ['SplashScreen', 'LoginWithPinScreen']

export const isNavStateRestorable = (state: NavigationState) => {
  const routes = state.routes.map((route) => route.name)
  const latestRoute = routes.length > 0 ? routes[routes.length - 1] : undefined

  return latestRoute && !excludedRoutesFromRestoring.includes(latestRoute)
}

export const setNavigationState = (state: NavigationState) =>
  rootStackNavigationRef.resetRoot(isNavStateRestorable(state) ? state : getInitialNavigationState())

export const resetNavigationState = (initialRouteName?: string) =>
  rootStackNavigationRef.resetRoot(getInitialNavigationState(initialRouteName))

// Navigating without the navigation prop:
// https://reactnavigation.org/docs/navigating-without-navigation-prop
export const navigateRootStack = <RouteName extends keyof RootStackParamList & keyof SendNavigationParamList>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  name: any, // TODO: Figure out why we can't use `RouteName` instead
  params?: RootStackParamList[RouteName] | SendNavigationParamList[RouteName]
) => {
  if (rootStackNavigationRef.isReady()) {
    rootStackNavigationRef.navigate(name, params)
  }
}
