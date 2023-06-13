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
import { Clipboard as ClipboardIcon } from 'lucide-react-native'
import { useEffect } from 'react'
import { ScrollView, Text } from 'react-native'
import QRCode from 'react-qr-code'
import { useTheme } from 'styled-components/native'

import Button from '~/components/buttons/Button'
import HighlightRow from '~/components/HighlightRow'
import { CenteredScreenSection, ScreenSection } from '~/components/layout/Screen'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { BackButton } from '~/screens/SendReceive/ScreenHeader'
import { copyAddressToClipboard } from '~/utils/addresses'

type ScreenProps = StackScreenProps<RootStackParamList, 'QRCodeScreen'>

const QRCodeScreen = ({ navigation, route: { params } }: ScreenProps) => {
  const theme = useTheme()

  useEffect(() => {
    navigation.getParent()?.setOptions({
      headerLeft: () => <BackButton onPress={() => navigation.goBack()} />
    })
  }, [navigation])

  return (
    <ScrollView>
      <CenteredScreenSection>
        <QRCode size={200} bgColor={theme.bg.secondary} fgColor={theme.font.primary} value={params.addressHash} />
      </CenteredScreenSection>
      <CenteredScreenSection>
        <Button title="Copy address" onPress={() => copyAddressToClipboard(params.addressHash)} Icon={ClipboardIcon} />
      </CenteredScreenSection>
      <ScreenSection>
        <HighlightRow title="Address">
          <Text numberOfLines={1} ellipsizeMode="middle">
            {params.addressHash}
          </Text>
        </HighlightRow>
      </ScreenSection>
    </ScrollView>
  )
}

export default QRCodeScreen
