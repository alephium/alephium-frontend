import { createNavigationContainerRef, NavigationProp, useIsFocused } from '@react-navigation/native'

import { selectIsAnyModalOpened } from '~/features/modals/modalSelectors'
import useIsTopModal from '~/features/modals/useIsTopModal'
import { useAppSelector } from '~/hooks/redux'
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

export const resetNavigation = (
  navigation: NavigationProp<RootStackParamList>,
  initialRouteName?: keyof RootStackParamList
) => {
  navigation.reset(getInitialNavigationState(initialRouteName))
}

export const useScreenIsFocused = useIsFocused

export const useScreenOrModaIsFocused = () => {
  const isAnyModalOpened = useAppSelector(selectIsAnyModalOpened)
  const isTopModal = useIsTopModal()
  const isScreenFocused = useIsFocused()

  return isTopModal || (!isAnyModalOpened && isScreenFocused)
}
