import { AddressHash } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { openModal } from '~/features/modals/modalActions'
import CameraScanButtonBase from '~/features/qrCodeScan/CameraScanButtonBase'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAllContacts } from '~/store/addresses/addressesSelectors'
import { showToast } from '~/utils/layout'

const CameraScanButton = () => {
  const isWalletConnectEnabled = useAppSelector((s) => s.settings.walletConnect)
  const walletConnectClientStatus = useAppSelector((s) => s.clients.walletConnect.status)
  const contacts = useAppSelector(selectAllContacts)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { pairWithDapp } = useWalletConnectContext()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const handleValidAddressScanned = (addressHash: AddressHash) => {
    if (contacts.some((c) => c.address === addressHash)) {
      navigation.navigate('SendNavigation', { destinationAddressHash: addressHash })
      sendAnalytics({ event: 'Captured contact address by scanning QR code from Dashboard' })
    } else {
      dispatch(openModal({ name: 'AddressQRCodeScanActionsModal', props: { addressHash } }))
      sendAnalytics({ event: 'Send: Captured destination address by scanning QR code from Dashboard' })
    }
  }

  const handleWalletConnectUriScanned = (uri: string) => {
    sendAnalytics({ event: 'WC: Scanned WC QR code' })

    if (isWalletConnectEnabled && walletConnectClientStatus === 'initialized') {
      pairWithDapp(uri)
    } else {
      showToast({
        text1: t('Experimental feature'),
        text2: t('WalletConnect is an experimental feature. You can enable it in the settings.'),
        type: 'info',
        onPress: () => navigation.navigate('SettingsScreen')
      })
    }
  }

  const generateInvalidDataText = (text: string) =>
    t('Did not detect a valid Alephium address or a WalletConnect QR code in scanned data: {{ data }}', { data: text })

  return (
    <CameraScanButtonBase
      text={
        isWalletConnectEnabled
          ? t('Scan an Alephium address QR code to send funds to or a WalletConnect QR code to connect to a dApp.')
          : t('Scan an Alephium address QR code to send funds to.')
      }
      origin="dashboard"
      onValidAddressScanned={handleValidAddressScanned}
      onWalletConnectUriScanned={handleWalletConnectUriScanned}
      generateInvalidDataText={generateInvalidDataText}
    />
  )
}
export default CameraScanButton
