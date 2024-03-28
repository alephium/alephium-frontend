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
import { BackButton } from '~/components/buttons/Button'
import FlatListScreen from '~/components/layout/FlatListScreen'
import Row from '~/components/Row'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAllAddresses } from '~/store/addressesSlice'
import { showToast, ToastDuration } from '~/utils/layout'

interface PublicKeysScreenProps extends StackScreenProps<RootStackParamList, 'PublicKeysScreen'> {}

const PublicKeysScreen = ({ navigation, ...props }: PublicKeysScreenProps) => {
  const addresses = useAppSelector(selectAllAddresses)

  const handleAddressPress = async (publicKey: string) => {
    try {
      await Clipboard.setStringAsync(publicKey)

      showToast({ text1: 'Public key copied!', visibilityTime: ToastDuration.SHORT })
      sendAnalytics('Copied public key')
    } catch (error) {
      console.log(error)
      showToast({ text1: 'Error while copying ', visibilityTime: ToastDuration.SHORT, type: 'error' })
    }
  }

  return (
    <FlatListScreen
      headerOptions={{
        headerTitle: 'Public keys',
        type: 'stack',
        headerLeft: () => <BackButton onPress={() => navigation.goBack()} />
      }}
      screenTitle="Public keys"
      screenIntro="Tap on an address to copy its public key to the clipboard."
      keyExtractor={(item) => item.hash}
      data={addresses}
      renderItem={({ item: address }) => (
        <Row key={address.hash} onPress={() => handleAddressPress(address.publicKey)}>
          <AddressBadge addressHash={address.hash} canCopy={false} />
        </Row>
      )}
      {...props}
    />
  )
}

export default PublicKeysScreen
