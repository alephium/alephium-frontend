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

import { StackScreenProps } from '@react-navigation/stack'
import { StyleProp, ViewStyle } from 'react-native'

import RootStackParamList from '~/navigation/rootStackRoutes'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import AddressListScreenBase from '~/screens/AddressListScreenBase'

type ScreenProps = StackScreenProps<SendNavigationParamList, 'SelectAddressScreen'> &
  StackScreenProps<RootStackParamList, 'SelectAddressScreen'> & {
    style?: StyleProp<ViewStyle>
  }

const SelectAddressScreen = ({ navigation, style, route: { params } }: ScreenProps) => (
  <AddressListScreenBase
    style={style}
    onAddressPress={(toAddressHash) =>
      navigation.navigate('SendNavigation', {
        screen: params.nextScreen,
        params: { toAddressHash }
      })
    }
  />
)

export default SelectAddressScreen
