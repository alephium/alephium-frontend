import { NavigationContainerRefWithCurrent } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

import RootStackParamList from '~/navigation/rootStackRoutes'

interface OnChildGoBackParams {
  childNavigationRef: NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>
  parentNavigation: StackNavigationProp<RootStackParamList, 'ReceiveNavigation' | 'SendNavigation'>
}

export const useOnChildNavigationGoBack =
  ({ childNavigationRef, parentNavigation }: OnChildGoBackParams) =>
  () => {
    if (!childNavigationRef.current?.canGoBack()) {
      parentNavigation.goBack()
    } else {
      childNavigationRef.current?.goBack()
    }
  }
