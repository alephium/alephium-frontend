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
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Surface from '~/components/layout/Surface'
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
  const { screenScrollHandler, screenScrollY } = useHeaderContext()
  const address = useAppSelector((s) => selectAddressByHash(s, params.addressHash))
  const { t } = useTranslation()

  useScrollToTopOnFocus(screenScrollY)

  const handleCopyAddressPress = () => {
    sendAnalytics({ event: 'Copied address', props: { note: 'Receive screen' } })

    copyAddressToClipboard(params.addressHash)
  }

  return (
    <ScrollScreen
      verticalGap
      contentPaddingTop
      onScroll={screenScrollHandler}
      screenTitle={t('Receive assets')}
      screenIntro={t('Scan the QR code to send funds to this address.')}
      bottomButtonsRender={() => (
        <Button title={t('Done')} variant="highlight" onPress={() => navigation.getParent()?.goBack()} />
      )}
      {...props}
    >
      <ScreenSection centered>
        <QRCodeContainer>
          <QRCode size={200} value={params.addressHash} />
        </QRCodeContainer>
      </ScreenSection>
      <ScreenSection centered>
        <Button short title={t('Copy address')} onPress={handleCopyAddressPress} iconProps={{ name: 'copy' }} />
      </ScreenSection>
      <ScreenSection>
        <Surface>
          <Row title={t('Address')} isLast={!address?.settings.label}>
            <AddressBadge addressHash={params.addressHash} />
          </Row>

          {address?.settings.label && (
            <Row isLast>
              <AppText numberOfLines={1} ellipsizeMode="middle">
                {params.addressHash}
              </AppText>
            </Row>
          )}
        </Surface>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default QRCodeScreen

const QRCodeContainer = styled.View`
  margin: 15px 0;
  padding: 25px;
  border-radius: ${BORDER_RADIUS_BIG}px;
  border: 2px solid ${({ theme }) => theme.border.primary};
`
