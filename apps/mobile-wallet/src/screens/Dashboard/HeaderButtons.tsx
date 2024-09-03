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

import { isValidAddress } from '@alephium/web3'
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import WalletConnectHeaderButton from '~/screens/Dashboard/WalletConnectHeaderButton'
import { cameraToggled } from '~/store/appSlice'
import { showToast } from '~/utils/layout'

interface HeaderButtonsProps {
  style?: StyleProp<ViewStyle>
}

const HeaderButtons = ({ style }: HeaderButtonsProps) => {
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const networkStatus = useAppSelector((s) => s.network.status)
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const isWalletConnectEnabled = useAppSelector((s) => s.settings.walletConnect)
  const walletConnectClientStatus = useAppSelector((s) => s.clients.walletConnect.status)
  const navigation = useNavigation<NavigationProp<RootStackParamList | SendNavigationParamList>>()
  const dispatch = useAppDispatch()
  const { pairWithDapp } = useWalletConnectContext()
  const isFocused = useIsFocused()
  const { t } = useTranslation()

  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const closeQRCodeScannerModal = () => dispatch(cameraToggled(false))

  const showOfflineMessage = () =>
    showToast({
      text1: `${t('Reconnecting')}...`,
      text2: t('The app is offline and trying to reconnect. Please, check your network settings.'),
      type: 'info',
      onPress: () => navigation.navigate('SettingsScreen')
    })

  const handleQRCodeScan = async (text: string) => {
    if (isValidAddress(text)) {
      navigation.navigate('SendNavigation', { screen: 'OriginScreen', params: { toAddressHash: text } })
      sendAnalytics({ event: 'Send: Captured destination address by scanning QR code from Dashboard' })
    } else if (text.startsWith('wc:')) {
      sendAnalytics({ event: 'WC: Scanned WC QR code' })

      if (isWalletConnectEnabled && walletConnectClientStatus === 'initialized') {
        pairWithDapp(text)
      } else {
        showToast({
          text1: t('Experimental feature'),
          text2: t('WalletConnect is an experimental feature. You can enable it in the settings.'),
          type: 'info',
          onPress: () => navigation.navigate('SettingsScreen')
        })
      }
    }
  }

  return (
    <>
      <View style={style}>
        <Button onPress={openQRCodeScannerModal} iconProps={{ name: 'maximize' }} round />
        <CenteredButtons>
          {networkStatus === 'offline' && (
            <Button onPress={showOfflineMessage} iconProps={{ name: 'cloud-off' }} variant="alert" round />
          )}
          {!isMnemonicBackedUp && (
            <Button
              onPress={() => navigation.navigate('BackupMnemonicNavigation')}
              iconProps={{ name: 'alert-triangle' }}
              variant="alert"
              round
            />
          )}
          {isWalletConnectEnabled && <WalletConnectHeaderButton />}
        </CenteredButtons>
        <Button onPress={() => navigation.navigate('SettingsScreen')} iconProps={{ name: 'settings' }} round />
      </View>
      {isCameraOpen && isFocused && (
        <QRCodeScannerModal
          onClose={closeQRCodeScannerModal}
          onQRCodeScan={handleQRCodeScan}
          text={
            isWalletConnectEnabled
              ? t('Scan an Alephium address QR code to send funds to or a WalletConnect QR code to connect to a dApp.')
              : t('Scan an Alephium address QR code to send funds to.')
          }
        />
      )}
    </>
  )
}

export default memo(styled(HeaderButtons)`
  flex-direction: row;
  align-items: center;
  gap: 15px;
`)

const CenteredButtons = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
`
