/*
Copyright 2018 - 2022 The Alephium Authors
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

import { BarCodeScanner } from 'expo-barcode-scanner'
import { BarCodeScanningResult, Camera, CameraType } from 'expo-camera'
import { Camera as CameraIcon } from 'lucide-react-native'
import { areFramesComplete, framesToData, parseFramesReducer, progressOfFrames, State as FrameState } from 'qrloop'
import React, { useEffect, useState } from 'react'
import { Dimensions } from 'react-native'
import { Bar as ProgressBar } from 'react-native-progress'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { CloseButton } from '~/components/buttons/Button'
import InfoBox from '~/components/InfoBox'
import Screen, { ScreenSection } from '~/components/layout/Screen'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import { BORDER_RADIUS } from '~/style/globalStyle'

interface QRCodeScannerModalProps {
  onClose: () => void
  onQRCodeScan: (data: string) => void
  qrCodeMode?: 'simple' | 'animated'
  text?: string
}

let frames: FrameState

const QRCodeScannerModal = ({ onClose, onQRCodeScan, qrCodeMode = 'simple', text }: QRCodeScannerModalProps) => {
  const theme = useTheme()

  const [hasPermission, setHasPermission] = useState<boolean>()
  const [scanned, setScanned] = useState(false)
  const [progress, setProgress] = useState(0)

  const insets = useSafeAreaInsets()

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } =
        qrCodeMode === 'animated'
          ? await Camera.requestCameraPermissionsAsync()
          : await BarCodeScanner.requestPermissionsAsync()

      setHasPermission(status === 'granted')
    }

    getCameraPermissions()
  }, [qrCodeMode])

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    if (qrCodeMode === 'animated') {
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
    <ScreenSectionCentered fill>
      {text && (
        <TextContainer>
          <AppText size={16} semiBold color="white" style={{ textAlign: 'center' }}>
            {text}
          </AppText>
        </TextContainer>
      )}

      <QRCodePlaceholder />

      {qrCodeMode === 'animated' && (
        <TextContainer>
          <AppTextCentered size={16} semiBold color="white">
            Scan progress: {(progress * 100).toFixed(0)}%
          </AppTextCentered>
          <ProgressBar progress={progress} color="white" />
        </TextContainer>
      )}
    </ScreenSectionCentered>
  )

  return (
    <ModalWithBackdrop visible animationType="fade" closeModal={onClose} color={theme.bg.primary}>
      <ScreenStyled>
        {!scanned &&
          hasPermission &&
          (qrCodeMode === 'animated' ? (
            <CameraStyled type={'back' as CameraType} onBarCodeScanned={handleBarCodeScanned}>
              {CameraContents}
            </CameraStyled>
          ) : (
            <BarCodeScannerStyled
              barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
              onBarCodeScanned={handleBarCodeScanned}
            >
              {CameraContents}
            </BarCodeScannerStyled>
          ))}

        {hasPermission === false && (
          <ScreenSection fill verticallyCentered>
            <InfoBox title="Camera permissions required" Icon={CameraIcon}>
              <AppText>Please, enable access to camera through the settings of your device.</AppText>
            </InfoBox>
          </ScreenSection>
        )}

        <ScreenSectionHeader style={{ paddingTop: insets.top }}>
          <CloseButton onPress={onClose} style={{ marginLeft: 'auto' }} variant="highlight" />
        </ScreenSectionHeader>
      </ScreenStyled>
    </ModalWithBackdrop>
  )
}

export default QRCodeScannerModal

const ScreenStyled = styled(Screen)`
  width: 100%;
`

const CameraStyled = styled(Camera)`
  flex: 1;
`

const BarCodeScannerStyled = styled(BarCodeScanner)`
  flex: 1;
`

const win = Dimensions.get('window')

const QRCodePlaceholder = styled.View`
  width: ${win.width - 100}px;
  height: ${win.width - 100}px;
  border: 4px dashed white;
  border-radius: ${BORDER_RADIUS}px;
  margin: 20px 0;
`

const ScreenSectionCentered = styled(ScreenSection)`
  justify-content: center;
  align-items: center;
`

const TextContainer = styled.View`
  border: 0px solid transparent; // This is a hack cause I don't freaking understand why the text doesn't expand
  align-items: center;
  gap: 10px;
  width: 70%;
`

const AppTextCentered = styled(AppText)`
  text-align: center;
`

const ScreenSectionHeader = styled(ScreenSection)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`
