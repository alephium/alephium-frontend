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

export const getNavStateLastRoute = (state: NavigationState) => {
  const routes = state.routes.map((route) => route.name)
  const latestRoute = routes.length > 0 ? routes[routes.length - 1] : undefined

  return latestRoute
}

export const resetNavigation = (
  navigation: NavigationProp<RootStackParamList>,
  initialRouteName?: keyof RootStackParamList
) => {
  navigation.dispatch(CommonActions.reset(getInitialNavigationState(initialRouteName)))
}
