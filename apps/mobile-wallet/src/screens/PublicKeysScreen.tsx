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

import { StackScreenProps } from '@react-navigation/stack'
import * as Clipboard from 'expo-clipboard'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import BoxSurface from '~/components/layout/BoxSurface'
import FlatListScreen, { FlatListScreenProps } from '~/components/layout/FlatListScreen'
import { ScreenSection } from '~/components/layout/Screen'
import Row from '~/components/Row'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAllAddresses } from '~/store/addressesSlice'
import { Address } from '~/types/addresses'
import { showToast, ToastDuration } from '~/utils/layout'

interface ScreenProps extends StackScreenProps<RootStackParamList, 'PublicKeysScreen'>, FlatListScreenProps<Address> {}

const PublicKeyScreen = ({ navigation, ...props }: ScreenProps) => {
  const addresses = useAppSelector(selectAllAddresses)

  const handleAddressPress = async (publicKey: string) => {
    try {
      await Clipboard.setStringAsync(publicKey)

      sendAnalytics('Copied public key')
      showToast({ text1: 'Public key copied!', visibilityTime: ToastDuration.SHORT })
    } catch (error) {
      console.log(error)
      showToast({ text1: 'Error while copying ', visibilityTime: ToastDuration.SHORT, type: 'error' })
    }
  }

  return (
    <FlatListScreen fill screenTitle="Public keys" headerOptions={{ type: 'stack' }} {...props}>
      <ScreenSection>
        <AppText>Tap on an address to copy its public key to the clipboard.</AppText>
      </ScreenSection>
      <ScreenSection>
        <BoxSurface>
          {addresses.map((address) => (
            <Row key={address.hash} onPress={() => handleAddressPress(address.publicKey)}>
              <AddressBadge addressHash={address.hash} />
            </Row>
          ))}
        </BoxSurface>
      </ScreenSection>
    </FlatListScreen>
  )
}

export default PublicKeyScreen
