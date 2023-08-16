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
import { usePostHog } from 'posthog-react-native'

import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import AddressListScreenBase from '~/screens/AddressListScreenBase'
import { AddressHash } from '~/types/addresses'

interface ScreenProps
  extends StackScreenProps<SendNavigationParamList, 'AddressQuickNavigationScreen'>,
    ScrollScreenProps {}

const AddressQuickNavigationScreen = ({ navigation, ...props }: ScreenProps) => {
  const posthog = usePostHog()

  const handleAddressPress = (addressHash: AddressHash) => {
    posthog?.capture('Used address quick navigation')

    navigation.navigate('AddressesTabNavigation', {
      screen: 'AddressesScreen',
      params: { addressHash }
    })
  }

  return <AddressListScreenBase onAddressPress={handleAddressPress} {...props} />
}

export default AddressQuickNavigationScreen
