import { AddressHash } from '@alephium/shared'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'

import StackHeader from '~/components/headers/StackHeader'
import { HeaderContextProvider, useHeaderContext } from '~/contexts/HeaderContext'
import AddressScreen from '~/features/receive/screens/AddressScreen'
import QRCodeScreen from '~/features/receive/screens/QRCodeScreen'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { SCREEN_OVERFLOW } from '~/style/globalStyle'

export interface ReceiveNavigationParamList extends ParamListBase {
  AddressScreen: undefined
  QRCodeScreen: { addressHash: AddressHash }
}

const ReceiveStack = createStackNavigator<ReceiveNavigationParamList>()

const ReceiveNavigation = ({ navigation }: StackScreenProps<RootStackParamList, 'ReceiveNavigation'>) => (
  <HeaderContextProvider>
    <ReceiveStack.Navigator
      screenOptions={{
        header: () => <ReceiveNavigationHeader />,
        cardStyle: { overflow: SCREEN_OVERFLOW },
        headerMode: 'float'
      }}
      initialRouteName="AddressScreen"
    >
      <ReceiveStack.Screen name="AddressScreen" component={AddressScreen} />
      <ReceiveStack.Screen name="QRCodeScreen" component={QRCodeScreen} />
    </ReceiveStack.Navigator>
  </HeaderContextProvider>
)

const ReceiveNavigationHeader = () => {
  const { headerOptions, screenScrollY } = useHeaderContext()
  const navigation = useNavigation()
  const { t } = useTranslation()

  return (
    <StackHeader
      options={{ headerTitle: t('Receive'), ...headerOptions }}
      titleAlwaysVisible
      scrollY={screenScrollY}
      onBackPress={() => navigation.goBack()}
    />
  )
}

export default ReceiveNavigation
