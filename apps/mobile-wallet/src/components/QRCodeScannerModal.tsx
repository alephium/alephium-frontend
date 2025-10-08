import { isValidAddress } from '@alephium/web3'
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera'
import { Camera as CameraIcon } from 'lucide-react-native'
import { areFramesComplete, framesToData, parseFramesReducer, progressOfFrames, State as FrameState } from 'qrloop'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions } from 'react-native'
import { Bar as ProgressBar } from 'react-native-progress'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import InfoBox from '~/components/InfoBox'
import Screen, { ScreenSection } from '~/components/layout/Screen'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import { BORDER_RADIUS, VERTICAL_GAP } from '~/style/globalStyle'
import { showToast, ToastDuration } from '~/utils/layout'

interface QRCodeScannerModalProps {
  onClose: () => void
  onQRCodeScan: (data: string) => void
  qrCodeMode?: 'simple' | 'animated'
  text?: string
}

let frames: FrameState

const QRCodeScannerModal = ({ onClose, onQRCodeScan, qrCodeMode = 'simple', text }: QRCodeScannerModalProps) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const [permission, requestPermission] = useCameraPermissions()

  const [scanned, setScanned] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (qrCodeMode === 'animated') {
      if (isValidAddress(data)) {
        onClose()
        showToast({
          text1: t('This is not the QR code you are looking for.'),
          text2: t(
            'To import from the desktop wallet, find the "Export current wallet" feature in the desktop wallet app settings.'
          ),
          type: 'error',
          visibilityTime: ToastDuration.LONG
        })
        return
      }

      try {
        frames = parseFramesReducer(frames, data)

        if (areFramesComplete(frames)) {
          onQRCodeScan(framesToData(frames).toString())
          frames = undefined
          setScanned(true)
          onClose()
        } else {
          setProgress(progressOfFrames(frames))
        }
      } catch (e) {
        console.warn(e)
      }
    } else {
      onQRCodeScan(data)
      setScanned(true)
      onClose()
    }
  }

  const CameraContents = (
    <ScreenSection fill centered verticallyCentered style={{ padding: '10%' }}>
      {text && (
        <TextContainer>
          <AppTextCentered size={16} semiBold color="white">
            {text}
          </AppTextCentered>
        </TextContainer>
      )}

      <QRCodePlaceholder />

      {qrCodeMode === 'animated' && (
        <TextContainer>
          <AppTextCentered size={16} semiBold color="white">
            {t('Scan progress')}: {(progress * 100).toFixed(0)}%
          </AppTextCentered>
          <ProgressBar progress={progress} color="white" />
        </TextContainer>
      )}
    </ScreenSection>
  )

  return (
    <ModalWithBackdrop visible closeModal={onClose} color={theme.bg.primary} showCloseButton animationType="fade">
      <ScreenStyled>
        {!scanned && permission?.status === 'granted' && (
          <CameraStyled
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          >
            {CameraContents}
          </CameraStyled>
        )}

        {permission?.granted === false && (
          <ScreenSection fill verticallyCentered>
            <InfoBox title={t('Camera permissions required')} Icon={CameraIcon}>
              <AppText>{t('Please, enable access to camera through the settings of your device.')}</AppText>
              {permission.canAskAgain && (
                <Button title={t('Allow')} onPress={requestPermission} style={{ marginTop: VERTICAL_GAP }} />
              )}
            </InfoBox>
          </ScreenSection>
        )}
      </ScreenStyled>
    </ModalWithBackdrop>
  )
}

export default QRCodeScannerModal

const ScreenStyled = styled(Screen)`
  width: 100%;
`

const CameraStyled = styled(CameraView)`
  flex: 1;
  align-items: center;
`

const win = Dimensions.get('window')

const QRCodePlaceholder = styled.View`
  width: ${win.width - 100}px;
  height: ${win.width - 100}px;
  border: 4px dashed white;
  border-radius: ${BORDER_RADIUS}px;
  margin: 20px 0;
`

const TextContainer = styled.View`
  border: 0px solid transparent;
  align-items: center;
  gap: 10px;
`

const AppTextCentered = styled(AppText)`
  text-align: center;
`
