import { createNavigationContainerRef, NavigationProp, useNavigation } from '@react-navigation/native'
import { useCallback, useSyncExternalStore } from 'react'

import { useModalContext } from '~/features/modals/ModalContext'
import { selectAllModals } from '~/features/modals/modalSelectors'
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

export const useAppScreenIsFocused = () => {
  const navigation = useNavigation()

  const openedModals = useAppSelector(selectAllModals)
  const { id: modalId } = useModalContext()
  const visibleModal = openedModals[openedModals.length - 1]
  const isTopModal = modalId === visibleModal?.id

  console.log('modalId:', modalId)

  const subscribe = useCallback(
    (callback: () => void) => {
      const unsubscribeFocus = navigation.addListener('focus', callback)
      const unsubscribeBlur = navigation.addListener('blur', callback)

      return () => {
        unsubscribeFocus()
        unsubscribeBlur()
      }
    },
    [navigation]
  )

  const value = !!useSyncExternalStore(subscribe, navigation.isFocused, navigation.isFocused)

  return isTopModal || (openedModals.length === 0 && value)
}
