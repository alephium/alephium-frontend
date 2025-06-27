import { AddressHash } from '@alephium/shared'
import { isValidAddress } from '@alephium/web3'
import { useTranslation } from 'react-i18next'
import { Linking } from 'react-native'
import { isAddress as isEthereumAddress } from 'web3-validator'

import { sendAnalytics } from '~/analytics'
import Button, { ButtonProps } from '~/components/buttons/Button'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { cameraToggled } from '~/store/appSlice'
import { showToast } from '~/utils/layout'
import { useIsScreenFocused } from '~/utils/navigation'

interface CameraScanButtonBaseProps extends ButtonProps {
  onValidAddressScanned: (addressHash: AddressHash) => void
  origin: 'dashboard' | 'contact'
  text: string
  onWalletConnectUriScanned?: (uri: string) => void
  generateInvalidDataText?: (text: string) => string
}

const CameraScanButtonBase = ({
  onValidAddressScanned,
  onWalletConnectUriScanned,
  text,
  origin,
  generateInvalidDataText,
  ...props
}: CameraScanButtonBaseProps) => {
  const isFocused = useIsScreenFocused()
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const closeQRCodeScannerModal = () => dispatch(cameraToggled(false))

  const handleQRCodeScan = async (text: string) => {
    if (isValidAddress(text)) {
      onValidAddressScanned(text)
    } else if (text.startsWith('wc:')) {
      onWalletConnectUriScanned?.(text)
    } else if (isEthereumAddress(text)) {
      showToast({
        text1: t('You scanned an Ethereum address'),
        text2: t('To move funds to Ethereum use the bridge at {{ url }}', { url: 'https://bridge.alephium.org' }),
        onPress: () => Linking.openURL('https://bridge.alephium.org'),
        type: 'error'
      })
      sendAnalytics({ event: 'Scanned Ethereum address', props: { origin } })
    } else {
      showToast({
        text1: t('Invalid scanned data'),
        text2: generateInvalidDataText
          ? generateInvalidDataText(text)
          : t('Did not detect a valid Alephium address in scanned data: {{ data }}', {
              data: text
            }),
        type: 'error'
      })
      sendAnalytics({ event: 'Scanned invalid address', props: { origin } })
    }
  }

  return (
    <>
      <Button onPress={openQRCodeScannerModal} iconProps={{ name: 'scan-outline' }} squared {...props} />
      {isCameraOpen && isFocused && (
        <QRCodeScannerModal onClose={closeQRCodeScannerModal} onQRCodeScan={handleQRCodeScan} text={text} />
      )}
    </>
  )
}

export default CameraScanButtonBase
