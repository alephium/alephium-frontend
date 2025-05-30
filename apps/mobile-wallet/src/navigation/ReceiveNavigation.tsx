import { AddressHash } from '@alephium/shared'
import {
  NavigationContainer,
  NavigationIndependentTree,
  ParamListBase,
  useNavigationContainerRef
} from '@react-navigation/native'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import StackHeader from '~/components/headers/StackHeader'
import { HeaderContextProvider, useHeaderContext } from '~/contexts/HeaderContext'
import AddressScreen from '~/features/receive/screens/AddressScreen'
import QRCodeScreen from '~/features/receive/screens/QRCodeScreen'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { useOnChildNavigationGoBack } from '~/navigation/useOnChildNavigationGoBack'

export interface ReceiveNavigationParamList extends ParamListBase {
  AddressScreen: undefined
  QRCodeScreen: { addressHash: AddressHash }
}

const ReceiveStack = createStackNavigator<ReceiveNavigationParamList>()

const ReceiveNavigation = ({
  navigation: parentNavigation
}: StackScreenProps<RootStackParamList, 'ReceiveNavigation'>) => {
  const navigationRef = useNavigationContainerRef()

  const handleGoBack = useOnChildNavigationGoBack({ childNavigationRef: navigationRef, parentNavigation })

  return (
    <HeaderContextProvider>
      <View style={{ flex: 1 }}>
        <ReceiveNavigationHeader onBackPress={handleGoBack} />
        <NavigationIndependentTree>
          <NavigationContainer ref={navigationRef}>
            <ReceiveStack.Navigator
              screenOptions={{
                headerShown: false
              }}
              initialRouteName="AddressScreen"
            >
              <ReceiveStack.Screen name="AddressScreen" component={AddressScreen} />
              <ReceiveStack.Screen name="QRCodeScreen" component={QRCodeScreen} />
            </ReceiveStack.Navigator>
          </NavigationContainer>
        </NavigationIndependentTree>
      </View>
    </HeaderContextProvider>
  )
}

interface ReceiveNavigationHeaderProps {
  onBackPress: () => void
}

const ReceiveNavigationHeader = ({ onBackPress }: ReceiveNavigationHeaderProps) => {
  const { headerOptions, screenScrollY } = useHeaderContext()
  const { t } = useTranslation()

  return (
    <StackHeader
      options={{ headerTitle: t('Receive'), ...headerOptions }}
      titleAlwaysVisible
      scrollY={screenScrollY}
      onBackPress={onBackPress}
    />
  )
}

export default ReceiveNavigation
