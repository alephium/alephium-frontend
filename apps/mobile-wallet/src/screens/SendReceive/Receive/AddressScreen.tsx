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
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback } from 'react'

import { sendAnalytics } from '~/analytics'
import AddressFlatListScreen from '~/components/AddressFlatListScreen'
import { CloseButton } from '~/components/buttons/Button'
import ScreenIntro from '~/components/layout/ScreenIntro'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { SendNavigationParamList } from '~/navigation/SendNavigation'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'AddressScreen'>, ScrollScreenProps {}

const AddressScreen = ({ navigation }: ScreenProps) => {
  const { setHeaderOptions, screenScrollHandler } = useHeaderContext()

  const handleAddressPress = (addressHash: AddressHash) => {
    sendAnalytics('Pressed on address to see QR code to receive funds')

    navigation.navigate('QRCodeScreen', { addressHash })
  }

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => <CloseButton onPress={() => navigation.goBack()} />
      })
    }, [navigation, setHeaderOptions])
  )

  return (
    <AddressFlatListScreen
      onAddressPress={(addressHash) => handleAddressPress(addressHash)}
      ListHeaderComponent={
        <ScreenIntro title="To address" subtitle="Select the address which you want to receive funds to." />
      }
      contrastedBg
      contentPaddingTop
      onScroll={screenScrollHandler}
    />
  )
}

export default AddressScreen
