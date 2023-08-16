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
import styled from 'styled-components/native'

import AddressBox from '~/components/AddressBox'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import ScreenIntro from '~/screens/SendReceive/ScreenIntro'
import { selectAllAddresses } from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'AddressScreen'>, ScrollScreenProps {}

const AddressScreen = ({ navigation, ...props }: ScreenProps) => {
  const addresses = useAppSelector(selectAllAddresses)
  const posthog = usePostHog()

  const handleAddressPress = (addressHash: AddressHash) => {
    posthog?.capture('Pressed on address to see QR code to receive funds')

    navigation.navigate('QRCodeScreen', { addressHash })
  }

  return (
    <ScrollScreen {...props}>
      <ScreenIntro
        title="Your addresses"
        subtitle="Select the address which you want to receive funds to."
        surtitle="RECEIVE"
      />
      <ScreenSection>
        <AddressList>
          {addresses.map(({ hash }) => (
            <AddressBox key={hash} addressHash={hash} onPress={() => handleAddressPress(hash)} />
          ))}
        </AddressList>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default AddressScreen

const AddressList = styled.View`
  gap: 20px;
`
