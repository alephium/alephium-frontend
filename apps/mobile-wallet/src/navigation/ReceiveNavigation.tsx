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

import { ParamListBase } from '@react-navigation/native'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'

import RootStackParamList from '@/navigation/rootStackRoutes'
import AddressScreen from '@/screens/SendReceive/Receive/AddressScreen'
import QRCodeScreen from '@/screens/SendReceive/Receive/QRCodeScreen'
import { AddressHash } from '@/types/addresses'

export interface ReceiveNavigationParamList extends ParamListBase {
  AddressScreen: undefined
  QRCodeScreen: { addressHash: AddressHash }
}

const ReceiveStack = createStackNavigator<ReceiveNavigationParamList>()

const ReceiveNavigation = ({ navigation }: StackScreenProps<RootStackParamList, 'ReceiveNavigation'>) => (
  <ReceiveStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AddressScreen">
    <ReceiveStack.Screen name="AddressScreen" component={AddressScreen} />
    <ReceiveStack.Screen name="QRCodeScreen" component={QRCodeScreen} />
  </ReceiveStack.Navigator>
)

export default ReceiveNavigation
