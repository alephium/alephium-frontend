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

import { SendContextProvider } from '~/contexts/SendContext'
import RootStackParamList from '~/navigation/rootStackRoutes'
import AssetsScreen from '~/screens/Send/AssetsScreen'
import DestinationScreen from '~/screens/Send/DestinationScreen'
import OriginScreen from '~/screens/Send/OriginScreen'
import VerifyScreen from '~/screens/Send/VerifyScreen'
import { AddressHash } from '~/types/addresses'

export interface SendNavigationParamList extends ParamListBase {
  DestinationScreen?: { fromAddressHash?: AddressHash }
  OriginScreen?: { toAddressHash?: AddressHash }
  AssetsScreen: undefined
  VerifyScreen: undefined
}

const SendStack = createStackNavigator<SendNavigationParamList>()

const SendNavigation = ({ navigation, route: { params } }: StackScreenProps<RootStackParamList, 'SendNavigation'>) => (
  <SendContextProvider>
    <SendStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={params?.toAddressHash ? 'OriginScreen' : 'DestinationScreen'}
    >
      <SendStack.Screen
        name="DestinationScreen"
        component={DestinationScreen}
        initialParams={params?.fromAddressHash ? { fromAddressHash: params.fromAddressHash } : undefined}
      />
      <SendStack.Screen
        name="OriginScreen"
        component={OriginScreen}
        initialParams={params?.toAddressHash ? { toAddressHash: params.toAddressHash } : undefined}
      />
      <SendStack.Screen name="AssetsScreen" component={AssetsScreen} />
      <SendStack.Screen name="VerifyScreen" component={VerifyScreen} />
    </SendStack.Navigator>
  </SendContextProvider>
)

export default SendNavigation
