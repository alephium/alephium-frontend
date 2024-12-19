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
