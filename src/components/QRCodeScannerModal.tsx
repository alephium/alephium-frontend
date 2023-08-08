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

import { BarCodeScanningResult, Camera, CameraType } from 'expo-camera'
import { Camera as CameraIcon, X } from 'lucide-react-native'
import { areFramesComplete, framesToData, parseFramesReducer, progressOfFrames, State as FrameState } from 'qrloop'
import React, { useEffect, useState } from 'react'
import { Dimensions } from 'react-native'
import { Bar as ProgressBar } from 'react-native-progress'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import InfoBox from '~/components/InfoBox'
import Screen, { ScreenSection } from '~/components/layout/Screen'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import { BORDER_RADIUS } from '~/style/globalStyle'

interface QRCodeScannerModalProps {
  onClose: () => void
  onQRCodeScan: (data: string) => void
}

let frames: FrameState

const QRCodeScannerModal = ({ onClose, onQRCodeScan }: QRCodeScannerModalProps) => {
  const theme = useTheme()

  const [hasPermission, setHasPermission] = useState<boolean>()
  const [scanned, setScanned] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()

      setHasPermission(status === 'granted')
    }

    getCameraPermissions()
  }, [])

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    try {
      frames = parseFramesReducer(frames, data)

      if (areFramesComplete(frames)) {
        onQRCodeScan(framesToData(frames).toString())
        setScanned(true)
        onClose()
      } else {
        setProgress(progressOfFrames(frames))
      }
    } catch (e) {
      console.warn(e)
    }
  }

  return (
    <ModalWithBackdrop visible animationType="fade" closeModal={onClose} color={theme.bg.primary}>
      <ScreenStyled>
        <ScreenSection>
          <CloseButton onPress={onClose}>
            <X size={32} color={theme.font.primary} />
          </CloseButton>
        </ScreenSection>
        {!scanned && hasPermission && (
          <CameraStyled type={'back' as CameraType} onBarCodeScanned={handleBarCodeScanned}>
            <ScreenSectionCentered fill>
              <AppTextCentered size={16} semiBold color="white">
                Scan the animated QR code from the desktop wallet
              </AppTextCentered>
              <QRCodePlaceholder />
              <AppTextCentered size={16} semiBold color="white">
                Scan progress: {(progress * 100).toFixed(0)}%
              </AppTextCentered>
              <ProgressBar progress={progress} color="white" />
            </ScreenSectionCentered>
          </CameraStyled>
        )}
        {hasPermission === false && (
          <ScreenSection fill>
            <InfoBox title="Camera permissions required" Icon={CameraIcon}>
              <AppText>Please, enable access to camera through the settings of your device.</AppText>
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

const CloseButton = styled.Pressable`
  margin-left: auto;
`

const CameraStyled = styled(Camera)`
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

const AppTextCentered = styled(AppText)`
  text-align: center;
`
