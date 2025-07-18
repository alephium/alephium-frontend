import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Image } from 'react-native'
import styled from 'styled-components/native'

import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import ListItem from '~/components/ListItem'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import AuthorizedConnectionsEmptyList from '~/features/ecosystem/authorizedConnections/AuthorizedConnectionsEmptyList'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'

interface WalletConnectPairingsModalProps {
  onPasteWcUrlPress: () => void
  onScanQRCodePress: () => void
}

const WalletConnectPairingsModal = memo<WalletConnectPairingsModalProps>(({ onPasteWcUrlPress, onScanQRCodePress }) => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()
  const { unpairFromDapp, walletConnectClient, activeSessions } = useWalletConnectContext()

  useEffect(() => {
    if (!walletConnectClient) dismissModal()
  }, [activeSessions.length, dismissModal, walletConnectClient])

  const handleDisconnectPress = async (pairingTopic: string) => {
    await unpairFromDapp(pairingTopic)
  }

  return (
    <BottomModal2 title={t('Current connections')} contentVerticalGap>
      {activeSessions.map(({ topic, peer: { metadata } }, index) => (
        <ListItem
          key={topic}
          title={metadata.url.replace('https://', '')}
          isLast={index === activeSessions.length - 1}
          icon={metadata.icons[0] ? <DAppIcon source={{ uri: metadata.icons[0] }} /> : undefined}
          rightSideContent={
            <Button iconProps={{ name: 'close' }} squared compact onPress={() => handleDisconnectPress(topic)} />
          }
        />
      ))}
      {activeSessions.length === 0 && <AuthorizedConnectionsEmptyList />}
      <BottomButtons fullWidth backgroundColor="back1">
        <Button title={t('Paste a WalletConnect URI')} onPress={onPasteWcUrlPress} iconProps={{ name: 'copy' }} />
        <Button title={t('Scan QR code')} onPress={onScanQRCodePress} iconProps={{ name: 'scan-outline' }} />
      </BottomButtons>
    </BottomModal2>
  )
})

export default WalletConnectPairingsModal

const DAppIcon = styled(Image)`
  width: 50px;
  height: 50px;
`
