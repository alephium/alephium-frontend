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

import { isAddressValid } from '@alephium/shared'
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native'
import { memo, useState } from 'react'
import { Platform, StyleProp, View, ViewStyle } from 'react-native'
import { Portal } from 'react-native-portalize'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import BottomModal from '~/components/layout/BottomModal'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import WalletConnectSVG from '~/images/logos/WalletConnectLogo'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import WalletConnectPairingsModal from '~/screens/Dashboard/WalletConnectPairingsModal'
import WalletConnectPasteUrlModal from '~/screens/Dashboard/WalletConnectPasteUrlModal'
import { cameraToggled } from '~/store/appSlice'
import { showToast } from '~/utils/layout'

interface DashboardHeaderActionsProps {
  style?: StyleProp<ViewStyle>
}

const DashboardHeaderActions = ({ style }: DashboardHeaderActionsProps) => {
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const networkStatus = useAppSelector((s) => s.network.status)
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const isWalletConnectEnabled = useAppSelector((s) => s.settings.walletConnect)
  const navigation = useNavigation<NavigationProp<RootStackParamList | SendNavigationParamList>>()
  const dispatch = useAppDispatch()
  const { pairWithDapp, walletConnectClient, activeSessions } = useWalletConnectContext()
  const isFocused = useIsFocused()

  const [isWalletConnectPairingsModalOpen, setIsWalletConnectPairingsModalOpen] = useState(false)
  const [isWalletConnectPasteUrlModalOpen, setIsWalletConnectPasteUrlModalOpen] = useState(false)

  const hasActiveWCSessions = activeSessions.length > 0
  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const closeQRCodeScannerModal = () => dispatch(cameraToggled(false))

  const showOfflineMessage = () =>
    showToast({
      text1: 'Reconnecting...',
      text2: 'The app is offline and trying to reconnect. Please, check your network settings.',
      type: 'info',
      onPress: () => navigation.navigate('SettingsScreen')
    })

  const handleQRCodeScan = async (text: string) => {
    if (isAddressValid(text)) {
      navigation.navigate('SendNavigation', { screen: 'OriginScreen', params: { toAddressHash: text } })
      sendAnalytics('Send: Captured destination address by scanning QR code from Dashboard')
    } else if (text.startsWith('wc:')) {
      if (isWalletConnectEnabled) {
        pairWithDapp(text)
      } else {
        showToast({
          text1: 'Experimental feature',
          text2: 'WalletConnect is an experimental feature. You can enable it in the settings.',
          type: 'info',
          onPress: () => navigation.navigate('SettingsScreen')
        })
      }
    }
  }

  return (
    <>
      <View style={style}>
        {networkStatus === 'offline' && (
          <Button onPress={showOfflineMessage} iconProps={{ name: 'cloud-offline-outline' }} variant="alert" round />
        )}
        {!isMnemonicBackedUp && (
          <Button
            onPress={() => navigation.navigate('BackupMnemonicNavigation')}
            iconProps={{ name: 'warning-outline' }}
            variant="alert"
            round
          />
        )}
        {isWalletConnectEnabled && walletConnectClient && (
          <Button
            onPress={() => setIsWalletConnectPairingsModalOpen(true)}
            customIcon={<WalletConnectSVG width={20} color={!hasActiveWCSessions ? '#3B99FC' : undefined} />}
            round
            style={hasActiveWCSessions ? { backgroundColor: '#3B99FC' } : undefined}
          />
        )}
        <Button onPress={openQRCodeScannerModal} iconProps={{ name: 'qr-code-outline' }} round />
        <Button onPress={() => navigation.navigate('SettingsScreen')} iconProps={{ name: 'settings-outline' }} round />
      </View>
      {isCameraOpen && isFocused && (
        <QRCodeScannerModal
          onClose={closeQRCodeScannerModal}
          onQRCodeScan={handleQRCodeScan}
          text={
            isWalletConnectEnabled
              ? 'Scan an Alephium address QR code to send funds to or a WalletConnect QR code to connect to a dApp.'
              : 'Scan an Alephium address QR code to send funds to.'
          }
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
            />
          )}
          isOpen={isWalletConnectPairingsModalOpen}
          onClose={() => setIsWalletConnectPairingsModalOpen(false)}
        />
      </Portal>
    </>
  )
}

export default memo(styled(DashboardHeaderActions)`
  flex-direction: row;
  align-items: center;
  gap: 15px;
`)
