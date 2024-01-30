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

import { CommonActions, createNavigationContainerRef, NavigationProp } from '@react-navigation/native'
import { NavigationState } from '@react-navigation/routers'

import RootStackParamList from '~/navigation/rootStackRoutes'

export const getInitialNavigationState = (initialRouteName: keyof RootStackParamList = 'InWalletTabsNavigation') => ({
  index: 0,
  routes: [
    {
      name: initialRouteName
    }
  ]
})

// To avoid circular imports, the navigator ref is defined and exported here instead of the RootStackNavigation.tsx file
// since the following util functions (that are used in screens imported by the RootStackNavigation) need the ref as
// well as the RootStackNavigation itself.
export const rootStackNavigationRef = createNavigationContainerRef<RootStackParamList>()

const excludedRoutesFromRestoring = ['LandingScreen', 'LoginWithPinScreen']

export const isNavStateRestorable = (state: NavigationState) => {
  const routes = state.routes.map((route) => route.name)
  const latestRoute = routes.length > 0 ? routes[routes.length - 1] : undefined

  return latestRoute && !excludedRoutesFromRestoring.includes(latestRoute)
}

export const restoreNavigation = (navigation: NavigationProp<RootStackParamList>, state: NavigationState) => {
  navigation.dispatch(CommonActions.reset(isNavStateRestorable(state) ? state : getInitialNavigationState()))
}

export const resetNavigation = (
  navigation: NavigationProp<RootStackParamList>,
  initialRouteName?: keyof RootStackParamList
) => {
  navigation.dispatch(CommonActions.reset(getInitialNavigationState(initialRouteName)))
}
