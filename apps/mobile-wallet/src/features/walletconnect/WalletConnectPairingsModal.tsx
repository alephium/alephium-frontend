import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Image } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import ListItem from '~/components/ListItem'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import { useAppDispatch } from '~/hooks/redux'

interface WalletConnectPairingsModalProps {
  onPasteWcUrlPress: () => void
  onScanQRCodePress: () => void
}

const WalletConnectPairingsModal = withModal<WalletConnectPairingsModalProps>(
  ({ id, onPasteWcUrlPress, onScanQRCodePress }) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const { unpairFromDapp, walletConnectClient, activeSessions } = useWalletConnectContext()

    useEffect(() => {
      if (!walletConnectClient) dispatch(closeModal({ id }))
    }, [activeSessions.length, dispatch, id, walletConnectClient])

    const handleDisconnectPress = async (pairingTopic: string) => {
      await unpairFromDapp(pairingTopic)
    }

    return (
      <BottomModal modalId={id} title={t('Current connections')}>
        <ModalContent verticalGap>
          {activeSessions.map(({ topic, peer: { metadata } }, index) => (
            <ListItem
              key={topic}
              title={metadata.url.replace('https://', '')}
              isLast={index === activeSessions.length - 1}
              icon={metadata.icons[0] ? <DAppIcon source={{ uri: metadata.icons[0] }} /> : undefined}
              rightSideContent={
                <Button onPress={() => handleDisconnectPress(topic)} iconProps={{ name: 'trash' }} type="transparent" />
              }
            />
          ))}
          {activeSessions.length === 0 && (
            <EmptyPlaceholder>
              <AppText>{t('There are no connections yet.')} 🔌</AppText>
            </EmptyPlaceholder>
          )}
          <BottomButtons fullWidth backgroundColor="back1">
            <Button title={t('Paste a WalletConnect URI')} onPress={onPasteWcUrlPress} iconProps={{ name: 'copy' }} />
            <Button title={t('Scan QR code')} onPress={onScanQRCodePress} iconProps={{ name: 'maximize' }} />
          </BottomButtons>
        </ModalContent>
      </BottomModal>
    )
  }
)

export default WalletConnectPairingsModal

const DAppIcon = styled(Image)`
  width: 50px;
  height: 50px;
`
