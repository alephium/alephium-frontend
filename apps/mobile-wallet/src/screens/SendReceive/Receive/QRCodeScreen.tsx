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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback } from 'react'
import QRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import Button, { BackButton, ContinueButton } from '~/components/buttons/Button'
import BoxSurface from '~/components/layout/BoxSurface'
import { ScreenSection } from '~/components/layout/Screen'
import ScreenIntro from '~/components/layout/ScreenIntro'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Row from '~/components/Row'
import { useHeaderContext } from '~/contexts/HeaderContext'
import useScrollToTopOnFocus from '~/hooks/layout/useScrollToTopOnFocus'
import { useAppSelector } from '~/hooks/redux'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import { selectAddressByHash } from '~/store/addressesSlice'
import { BORDER_RADIUS_BIG } from '~/style/globalStyle'
import { copyAddressToClipboard } from '~/utils/addresses'

interface ScreenProps extends StackScreenProps<ReceiveNavigationParamList, 'QRCodeScreen'>, ScrollScreenProps {}

const QRCodeScreen = ({ navigation, route: { params }, ...props }: ScreenProps) => {
  const theme = useTheme()
  const { setHeaderOptions, screenScrollHandler, screenScrollY } = useHeaderContext()
  const address = useAppSelector((s) => selectAddressByHash(s, params.addressHash))

  useScrollToTopOnFocus(screenScrollY)

  const handleCopyAddressPress = () => {
    sendAnalytics('Copied address', { note: 'Receive screen' })

    copyAddressToClipboard(params.addressHash)
  }

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
        headerRight: () => (
          <ContinueButton
            onPress={() => navigation.getParent()?.goBack()}
            iconProps={{ name: 'checkmark' }}
            title="Done"
          />
        )
      })
    }, [navigation, setHeaderOptions])
  )

  return (
    <ScrollScreen verticalGap contentPaddingTop onScroll={screenScrollHandler} {...props}>
      <ScreenIntro title="Scan" subtitle="Scan the QR code to send funds to this address." />
      <ScreenSection centered>
        <QRCodeContainer>
          <QRCode size={200} bgColor={theme.bg.highlight} fgColor={theme.font.primary} value={params.addressHash} />
        </QRCodeContainer>
      </ScreenSection>
      <ScreenSection centered>
        <Button title="Copy address" onPress={handleCopyAddressPress} iconProps={{ name: 'copy-outline' }} />
      </ScreenSection>
      <ScreenSection>
        <BoxSurface>
          <Row title="Address" isLast={!address?.settings.label}>
            <AddressBadge addressHash={params.addressHash} />
          </Row>

          {address?.settings.label && (
            <Row isLast>
              <AppText numberOfLines={1} ellipsizeMode="middle">
                {params.addressHash}
              </AppText>
            </Row>
          )}
        </BoxSurface>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default QRCodeScreen

const QRCodeContainer = styled.View`
  margin: 15px 0;
  padding: 25px;
  border-radius: ${BORDER_RADIUS_BIG}px;
  background-color: ${({ theme }) => theme.bg.highlight};
`
