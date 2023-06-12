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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import { useSendContext } from '~/contexts/SendContext'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import AddressBox from '~/screens/Send/OriginScreen/AddressBox'
import { BackButton, ContinueButton } from '~/screens/Send/SendScreenHeader'
import SendScreenIntro from '~/screens/Send/SendScreenIntro'
import { selectAllAddresses, selectDefaultAddress } from '~/store/addressesSlice'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'OriginScreen'> {
  style?: StyleProp<ViewStyle>
}

const OriginScreen = ({ navigation, style }: ScreenProps) => {
  const { fromAddress, setFromAddress } = useSendContext()
  const addresses = useAppSelector(selectAllAddresses)
  const defaultAddress = useAppSelector(selectDefaultAddress)

  useFocusEffect(() => {
    navigation.getParent()?.setOptions({
      headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
      headerRight: () => <ContinueButton onPress={() => navigation.navigate('AssetsScreen')} />
    })

    if (!fromAddress && defaultAddress) setFromAddress(defaultAddress.hash)
  })

  return (
    <ScrollScreen style={style}>
      <SendScreenIntro title="Origin" subtitle="Select the address from which to send the transaction." />
      <ScreenSection>
        <AddressList>
          {addresses.map((address) => (
            <AddressBox key={address.hash} addressHash={address.hash} />
          ))}
        </AddressList>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default OriginScreen

const AddressList = styled.View`
  gap: 20px;
`
