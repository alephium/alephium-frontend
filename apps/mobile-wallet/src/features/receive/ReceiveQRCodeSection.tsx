import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import { useAppSelector } from '~/hooks/redux'
import { selectAddressByHash } from '~/store/addresses/addressesSelectors'
import { BORDER_RADIUS_BIG } from '~/style/globalStyle'
import { copyAddressToClipboard } from '~/utils/addresses'

interface ReceiveQRCodeSectionProps {
  addressHash: string
}

const ReceiveQRCodeSection = ({ addressHash }: ReceiveQRCodeSectionProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const { t } = useTranslation()

  const handleCopyAddressPress = () => {
    sendAnalytics({ event: 'Copied address', props: { note: 'Receive screen' } })

    copyAddressToClipboard(addressHash)
  }

  return (
    <>
      <ScreenSection centered>
        <QRCodeContainer>
          <QRCode size={200} value={addressHash} />
        </QRCodeContainer>
      </ScreenSection>
      <ScreenSection centered verticalGap>
        <Button short title={t('Copy address')} onPress={handleCopyAddressPress} iconProps={{ name: 'copy' }} />
      </ScreenSection>
      <ScreenSection>
        <Surface>
          <Row title={t('Address')} isLast={!address?.label}>
            <AddressBadge addressHash={addressHash} />
          </Row>

          {address?.label && (
            <Row isLast>
              <AppText truncate ellipsizeMode="middle">
                {addressHash}
              </AppText>
            </Row>
          )}
        </Surface>
      </ScreenSection>
    </>
  )
}

export default ReceiveQRCodeSection

const QRCodeContainer = styled.View`
  margin: 15px 0;
  padding: 20px;
  border-radius: ${BORDER_RADIUS_BIG}px;
  border: 2px solid ${({ theme }) => theme.border.primary};
  background-color: white;
`
