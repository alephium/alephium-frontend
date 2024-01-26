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
import { Image } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import ListItem from '~/components/ListItem'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'

interface WalletConnectPairingsModalProps extends ModalContentProps {
  onPasteWcUrlPress: () => void
}

const WalletConnectPairingsModal = ({ onPasteWcUrlPress, onClose, ...props }: WalletConnectPairingsModalProps) => {
  const { unpairFromDapp, walletConnectClient, activeSessions } = useWalletConnectContext()

  useEffect(() => {
    if (!walletConnectClient) onClose && onClose()
  }, [activeSessions.length, onClose, walletConnectClient])

  const handleDisconnectPress = async (pairingTopic: string) => {
    await unpairFromDapp(pairingTopic)
  }

  return (
    <ModalContent verticalGap {...props}>
      <ScreenSection>
        <BottomModalScreenTitle>Current connections</BottomModalScreenTitle>
      </ScreenSection>

      {activeSessions.map(({ topic, peer: { metadata } }, index) => (
        <ListItem
          key={topic}
          title={metadata.url.replace('https://', '')}
          isLast={index === activeSessions.length - 1}
          icon={metadata.icons[0] ? <DAppIcon source={{ uri: metadata.icons[0] }} /> : undefined}
          rightSideContent={
            <Button
              onPress={() => handleDisconnectPress(topic)}
              iconProps={{ name: 'remove-circle' }}
              type="transparent"
            />
          }
        />
      ))}
      {activeSessions.length === 0 && (
        <EmptyPlaceholder>
          <AppText>There are no connections yet. 🔌</AppText>
        </EmptyPlaceholder>
      )}
      <ScreenSection>
        <Button title="Paste a WalletConnect URL" variant="accent" onPress={onPasteWcUrlPress} />
      </ScreenSection>
    </ModalContent>
  )
}

export default WalletConnectPairingsModal

const DAppIcon = styled(Image)`
  width: 50px;
  height: 50px;
`
