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
import { ParamListBase } from '@react-navigation/native'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'

import ProgressHeader from '~/components/headers/ProgressHeader'
import { HeaderContextProvider, useHeaderContext } from '~/contexts/HeaderContext'
import RootStackParamList from '~/navigation/rootStackRoutes'
import AddressScreen from '~/screens/SendReceive/Receive/AddressScreen'
import QRCodeScreen from '~/screens/SendReceive/Receive/QRCodeScreen'
import { SCREEN_OVERFLOW } from '~/style/globalStyle'

export interface ReceiveNavigationParamList extends ParamListBase {
  AddressScreen: undefined
  QRCodeScreen: { addressHash: AddressHash }
}

const ReceiveStack = createStackNavigator<ReceiveNavigationParamList>()

const ReceiveNavigation = ({ navigation }: StackScreenProps<RootStackParamList, 'ReceiveNavigation'>) => (
  <HeaderContextProvider>
    <ReceiveProgressHeader />
    <ReceiveStack.Navigator
      screenOptions={{ headerShown: false, cardStyle: { overflow: SCREEN_OVERFLOW } }}
      initialRouteName="AddressScreen"
    >
      <ReceiveStack.Screen name="AddressScreen" component={AddressScreen} />
      <ReceiveStack.Screen name="QRCodeScreen" component={QRCodeScreen} />
    </ReceiveStack.Navigator>
  </HeaderContextProvider>
)

const ReceiveProgressHeader = () => {
  const { headerOptions, screenScrollY } = useHeaderContext()

  return (
    <ProgressHeader options={{ headerTitle: 'Receive', ...headerOptions }} workflow="receive" scrollY={screenScrollY} />
  )
}

export default ReceiveNavigation
