import { keyring } from '@alephium/keyring'
import { addressesImported, AddressHash, selectWatchOnlyAddressesHashes } from '@alephium/shared'
import { StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'

import AddressBox from '~/components/AddressBox'
import Button from '~/components/buttons/Button'
import FlashListScreen from '~/components/layout/FlashListScreen'
import { ScreenSectionTitle } from '~/components/layout/Screen'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { cameraToggled } from '~/store/appSlice'
import { showToast } from '~/utils/layout'

interface SeedSignerScreenProps extends StackScreenProps<RootStackParamList, 'SeedSignerScreen'> {}

const SeedSignerScreen = ({ navigation, ...props }: SeedSignerScreenProps) => {
  const watchOnlyAddressesHashes = useAppSelector(selectWatchOnlyAddressesHashes)
  const { t } = useTranslation()
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const dispatch = useAppDispatch()

  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const closeQRCodeScannerModal = () => dispatch(cameraToggled(false))

  // scannedData: "[73c5da0a/44h/1234h/0h/0/0]b6BwfyxyCLDgTJXNiDbpdjoixbc77f4SGGk865GpCPdQpY6LvVTdvAPH3Aazr33juaqeWYNCxt82MSV9SRQCoR2bXXoZ8SWChXXHT6t6Sogn"
  const handleQRCodeScan = async (scannedData: string) => {
    const cleanedScannedData = scannedData.slice(1)
    const firstSlashIndex = cleanedScannedData.indexOf('/')
    const fingerprint = cleanedScannedData.slice(0, firstSlashIndex)
    const rest = cleanedScannedData.slice(firstSlashIndex + 1)
    const [derivationPath, publicKey] = rest.split(']')
    const [purpose, coinType, account, change, index] = derivationPath.split('/')

    const address = keyring.deriveAddressFromPublicKey(publicKey, 'default', parseInt(index))
    const addressWithSettings = {
      ...address,
      isDefault: false,
      color: 'red',
      isWatchOnly: true
    }

    dispatch(addressesImported([addressWithSettings]))

    showToast({
      text1: 'Watch-only address imported',
      text2: address.hash,
      type: 'success'
    })
  }

  const handleAddressPress = (addressHash: AddressHash) => {
    dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
  }

  return (
    <>
      <FlashListScreen
        headerOptions={{ headerTitle: t('Watch-only addresses'), type: 'stack' }}
        screenTitle={t('Watch-only addresses')}
        screenIntro={t('Scan the animated QR code from SeedSigner to import public keys.')}
        data={watchOnlyAddressesHashes}
        contentPaddingTop
        ListHeaderComponent={() => (
          <>
            <Button title={t('Import public key')} onPress={openQRCodeScannerModal} />
            <ScreenSectionTitle>{t('Imported watch-only addresses')}</ScreenSectionTitle>
          </>
        )}
        renderItem={({ item: addressHash, index }) => (
          <AddressBox
            key={addressHash}
            addressHash={addressHash}
            isLast={index === watchOnlyAddressesHashes.length - 1}
            onPress={() => handleAddressPress(addressHash)}
            origin="watchOnlyAddressesScreen"
          />
        )}
        {...props}
      />
      {isCameraOpen && (
        <QRCodeScannerModal
          onClose={closeQRCodeScannerModal}
          onQRCodeScan={handleQRCodeScan}
          text={t('Scan the animated QR code from SeedSigner.')}
        />
      )}
    </>
  )
}

export default SeedSignerScreen
