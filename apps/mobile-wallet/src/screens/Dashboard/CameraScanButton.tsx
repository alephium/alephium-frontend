import { isValidAddress } from '@alephium/web3'
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { Linking } from 'react-native'
import { isAddress as isEthereumAddress } from 'web3-validator'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { cameraToggled } from '~/store/appSlice'
import { showToast } from '~/utils/layout'

const CameraScanButton = () => {
  const isFocused = useIsFocused()
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const isWalletConnectEnabled = useAppSelector((s) => s.settings.walletConnect)
  const walletConnectClientStatus = useAppSelector((s) => s.clients.walletConnect.status)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { pairWithDapp } = useWalletConnectContext()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const closeQRCodeScannerModal = () => dispatch(cameraToggled(false))

  const handleQRCodeScan = async (text: string) => {
    if (isValidAddress(text)) {
      navigation.navigate('SendNavigation', { destinationAddressHash: text })
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
    } else if (isEthereumAddress(text)) {
      showToast({
        text1: t('You scanned an Ethereum address'),
        text2: t('To move funds to Ethereum use the bridge at {{ url }}', { url: 'https://bridge.alephium.org' }),
        onPress: () => Linking.openURL('https://bridge.alephium.org'),
        type: 'error'
      })
    } else {
      showToast({
        text1: t('Invalid scanned data'),
        text2: t('Did not detect a valid Alephium address or a WalletConnect QR code in scanned data: {{ data }}', {
          data: text
        }),
        type: 'error'
      })
    }
  }

  return (
    <>
      <Button onPress={openQRCodeScannerModal} iconProps={{ name: 'maximize' }} squared />
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
export default CameraScanButton
