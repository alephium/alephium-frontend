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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Platform } from 'react-native'
import { Portal } from 'react-native-portalize'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import BoxSurface from '~/components/layout/BoxSurface'
import { ModalContent } from '~/features/modals/ModalContent'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import BottomModal from '~/features/modals/DeprecatedBottomModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import WalletConnectSVG from '~/images/logos/WalletConnectLogo'
import WalletConnectPairingsModal from '~/screens/Dashboard/WalletConnectPairingsModal'
import WalletConnectPasteUrlModal from '~/screens/Dashboard/WalletConnectPasteUrlModal'
import { cameraToggled } from '~/store/appSlice'

const WalletConnectHeaderButton = () => {
  const theme = useTheme()
  const walletConnectClientStatus = useAppSelector((s) => s.clients.walletConnect.status)
  const walletConnectClientError = useAppSelector((s) => s.clients.walletConnect.errorMessage)
  const { activeSessions, resetWalletConnectClientInitializationAttempts } = useWalletConnectContext()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const [isWalletConnectPairingsModalOpen, setIsWalletConnectPairingsModalOpen] = useState(false)
  const [isWalletConnectPasteUrlModalOpen, setIsWalletConnectPasteUrlModalOpen] = useState(false)
  const [isWalletConnectErrorModalOpen, setIsWalletConnectErrorModalOpen] = useState(false)

  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))

  return (
    <>
      {walletConnectClientStatus === 'initialization-failed' ? (
        <Button
          variant="alert"
          onPress={() => setIsWalletConnectErrorModalOpen(true)}
          customIcon={<WalletConnectSVG width={20} color={theme.global.alert} />}
          round
        />
      ) : walletConnectClientStatus === 'initialized' ? (
        <Button
          onPress={() => setIsWalletConnectPairingsModalOpen(true)}
          style={activeSessions.length ? { backgroundColor: '#3B99FC' } : undefined}
          customIcon={<WalletConnectSVG width={20} color={activeSessions.length ? '#fff' : '#3B99FC'} />}
          round
        />
      ) : (
        <Button
          style={{ width: 80 }}
          customIcon={
            <>
              <WalletConnectSVG width={20} color={theme.font.secondary} />
              <ActivityIndicator size={16} color={theme.font.tertiary} />
            </>
          }
          round
        />
      )}

      <Portal>
        <BottomModal
          Content={WalletConnectPasteUrlModal}
          isOpen={isWalletConnectPasteUrlModalOpen}
          onClose={() => setIsWalletConnectPasteUrlModalOpen(false)}
          maximisedContent={Platform.OS === 'ios'}
        />
      </Portal>

      <Portal>
        <BottomModal
          Content={(props) => (
            <WalletConnectPairingsModal
              {...props}
              onPasteWcUrlPress={() => {
                props.onClose && props.onClose()
                setIsWalletConnectPasteUrlModalOpen(true)
              }}
              onScanQRCodePress={() => {
                props.onClose && props.onClose()
                openQRCodeScannerModal()
              }}
            />
          )}
          isOpen={isWalletConnectPairingsModalOpen}
          onClose={() => setIsWalletConnectPairingsModalOpen(false)}
        />
      </Portal>
      <Portal>
        <BottomModal
          isOpen={isWalletConnectErrorModalOpen}
          onClose={() => setIsWalletConnectErrorModalOpen(false)}
          Content={(props) => (
            <ModalContent verticalGap {...props}>
              <ScreenSection>
                <ModalScreenTitle>{t('Could not connect to WalletConnect')}</ModalScreenTitle>
              </ScreenSection>
              {walletConnectClientError && (
                <ScreenSection>
                  <BoxSurface>
                    <AppTextStyled>{walletConnectClientError}</AppTextStyled>
                  </BoxSurface>
                </ScreenSection>
              )}
              <ScreenSection centered>
                <ButtonsRow>
                  <Button title={t('Close')} onPress={props.onClose && props.onClose} flex />
                  <Button
                    title={t('Retry')}
                    variant="accent"
                    onPress={() => {
                      resetWalletConnectClientInitializationAttempts()
                      props.onClose && props.onClose()
                    }}
                    flex
                  />
                </ButtonsRow>
              </ScreenSection>
            </ModalContent>
          )}
        />
      </Portal>
    </>
  )
}

export default WalletConnectHeaderButton

const AppTextStyled = styled(AppText)`
  font-family: monospace;
  padding: 10px;
`
