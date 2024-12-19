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
