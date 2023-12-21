/*
Copyright 2018 - 2023 The Alephium Authors
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
import { createStackNavigator } from '@react-navigation/stack'

import { SendContextProvider } from '~/contexts/SendContext'
import AssetsScreen from '~/screens/SendReceive/Send/AssetsScreen'
import DestinationScreen from '~/screens/SendReceive/Send/DestinationScreen'
import OriginScreen from '~/screens/SendReceive/Send/OriginScreen'
import VerifyScreen from '~/screens/SendReceive/Send/VerifyScreen'

export interface SendNavigationParamList extends ParamListBase {
  DestinationScreen: { fromAddressHash?: AddressHash }
  OriginScreen?: { toAddressHash?: AddressHash }
  AssetsScreen?: { toAddressHash?: AddressHash }
  VerifyScreen: undefined
}

export type PossibleNextScreenAfterDestination = 'OriginScreen' | 'AssetsScreen'

const SendStack = createStackNavigator<SendNavigationParamList>()

const SendNavigation = () => (
  <SendContextProvider>
    <SendStack.Navigator
      screenOptions={{
        headerShown: false // Header is in parent above
      }}
      initialRouteName="DestinationScreen"
    >
      <SendStack.Screen name="DestinationScreen" component={DestinationScreen} />
      <SendStack.Screen name="OriginScreen" component={OriginScreen} />
      <SendStack.Screen name="AssetsScreen" component={AssetsScreen} />
      <SendStack.Screen name="VerifyScreen" component={VerifyScreen} />
    </SendStack.Navigator>
  </SendContextProvider>
)

export default SendNavigation
