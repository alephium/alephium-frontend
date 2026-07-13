import { AnalyticsEvent } from '@alephium/shared'
import { AddressHash } from '@alephium/shared/types'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { openModal } from '~/features/modals/modalActions'
import CameraScanButtonBase from '~/features/qrCodeScan/CameraScanButtonBase'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAllContacts } from '~/store/addresses/addressesSelectors'

const CameraScanButton = () => {
  const walletConnectClientStatus = useAppSelector((s) => s.clients.walletConnect.status)
  const contacts = useAppSelector(selectAllContacts)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { pairWithDapp } = useWalletConnectContext()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const handleValidAddressScanned = (addressHash: AddressHash) => {
    if (contacts.some((c) => c.address === addressHash)) {
      navigation.navigate('SendNavigation', { origin: 'qr_code_scan', destinationAddressHash: addressHash })
      sendAnalytics({ event: AnalyticsEvent.CAPTURED_CONTACT_ADDRESS_BY_SCANNING_QR_CODE_FROM_DASHBOARD })
    } else {
      dispatch(openModal({ name: 'AddressQRCodeScanActionsModal', props: { addressHash } }))
      sendAnalytics({ event: AnalyticsEvent.SEND_CAPTURED_DESTINATION_ADDRESS_BY_SCANNING_QR_CODE_FROM_DASHBOARD })
    }
  }

  const handleWalletConnectUriScanned = (uri: string) => {
    sendAnalytics({ event: AnalyticsEvent.WC_SCANNED_WC_QR_CODE })

    if (walletConnectClientStatus === 'initialized') {
      pairWithDapp(uri)
    }
  }

  const generateInvalidDataText = (text: string) =>
    t('Did not detect a valid Alephium address or a WalletConnect QR code in scanned data: {{ data }}', { data: text })

  return (
    <CameraScanButtonBase
      text={t('Scan an Alephium address QR code to send funds to or a WalletConnect QR code to connect to a dApp.')}
      origin="dashboard"
      onValidAddressScanned={handleValidAddressScanned}
      onWalletConnectUriScanned={handleWalletConnectUriScanned}
      generateInvalidDataText={generateInvalidDataText}
    />
  )
}
export default CameraScanButton
