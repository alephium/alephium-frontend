import { keyring } from '@alephium/keyring'
import { addressesImported, selectAllAddresses } from '@alephium/shared'
import { useEffect } from 'react'

import Button from '~/components/buttons/Button'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import Row from '~/components/Row'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { cameraToggled } from '~/store/appSlice'
import { showToast } from '~/utils/layout'

const ImportWatchOnlyWalletRow = () => {
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const dispatch = useAppDispatch()
  const persistAddressSettings = usePersistAddressSettings()

  const addresses = useAppSelector(selectAllAddresses)

  useEffect(() => {
    console.log({ addresses: JSON.stringify(addresses, null, 2) })
  }, [addresses])

  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const closeQRCodeScannerModal = () => dispatch(cameraToggled(false))

  const handleImportWatchOnlyWallet = () => {
    openQRCodeScannerModal()
  }

  const handleQRCodeScan = async (scannedData: string) => {
    const cleanedScannedData = scannedData.slice(1)
    console.log({ scannedData, cleanedScannedData })
    const firstSlashIndex = cleanedScannedData.indexOf('/')
    const fingerprint = cleanedScannedData.slice(0, firstSlashIndex)
    const rest = cleanedScannedData.slice(firstSlashIndex + 1)
    const [derivationPath, publicKey] = rest.split(']')
    const [purpose, coinType, account, change, index] = derivationPath.split('/')

    console.log({ fingerprint, derivationPath, publicKey })

    //  LOG  {"scannedData": "[73c5da0a/44h/1234h/0h/0/0]b6BwfyxyCLDgTJXNiDbpdjoixbc77f4SGGk865GpCPdQpY6LvVTdvAPH3Aazr33juaqeWYNCxt82MSV9SRQCoR2bXXoZ8SWChXXHT6t6Sogn"}

    const address = keyring.deriveAddressFromPublicKey(publicKey, 'default', parseInt(index))
    const addressWithSettings = {
      ...address,
      isDefault: false,
      color: 'red',
      isWatchOnly: true
    }

    console.log({ addressWithSettings })

    // await persistAddressSettings([addressWithSettings])
    dispatch(addressesImported([addressWithSettings]))

    showToast({
      text1: 'Watch-only address imported',
      text2: address.hash,
      type: 'success'
    })
  }

  return (
    <>
      <Row title="Import watch-only wallet" subtitle="Scan a QR code to import a watch-only wallet.">
        <Button title="Import" onPress={handleImportWatchOnlyWallet} short />
      </Row>
      {isCameraOpen && (
        <QRCodeScannerModal
          onClose={closeQRCodeScannerModal}
          onQRCodeScan={handleQRCodeScan}
          text="Scan the animated QR code from SeedSigner."
          // qrCodeMode="animated"
        />
      )}
    </>
  )
}

export default ImportWatchOnlyWalletRow
