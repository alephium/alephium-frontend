import { colord } from 'colord'
import { ScanLine } from 'lucide-react-native'
import { dataToFrames } from 'qrloop'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import InfoBox from '~/components/InfoBox'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import QRCodeLoop, { QRCodeLoopProps } from '~/features/seedSigner/QRCodeLoop'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { cameraToggled } from '~/store/appSlice'

export interface UnsignedTxQrCodeModalProps {
  unsignedTxData: string
  onSendSuccess: () => void
}

const UnsignedTxQrCodeModal = memo<UnsignedTxQrCodeModalProps>(({ unsignedTxData, onSendSuccess }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [frames, setFrames] = useState<QRCodeLoopProps['frames']>([])
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const dispatch = useAppDispatch()
  const { dismissModal } = useModalContext()

  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const closeQRCodeScannerModal = () => dispatch(cameraToggled(false))

  useEffect(() => {
    setFrames(dataToFrames(unsignedTxData, 50, 4))
  }, [unsignedTxData])

  const handleQRCodeScan = (scannedData: string) => {
    console.log('scannedData', scannedData)
    dismissModal()
    onSendSuccess()
  }

  return (
    <BottomModal2 notScrollable title={t('Disclaimer')} contentVerticalGap>
      <InfoBox
        title="Scan"
        Icon={ScanLine}
        bgColor={colord(theme.global.accent).alpha(0.15).toHex()}
        iconColor={theme.global.accent}
      >
        <AppText>{t('Scan this animated QR code with your signer device.')}</AppText>
      </InfoBox>
      <QRCodeLoop frames={frames} />
      <Button
        title="Scan signed transaction"
        onPress={openQRCodeScannerModal}
        variant="contrast"
        iconProps={{ name: 'scan' }}
      />

      {isCameraOpen && (
        <QRCodeScannerModal
          onClose={closeQRCodeScannerModal}
          onQRCodeScan={handleQRCodeScan}
          text={t('Scan the animated QR code from SeedSigner.')}
          // qrCodeMode="animated"
        />
      )}
    </BottomModal2>
  )
})

export default UnsignedTxQrCodeModal
