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

import { BarCodeScannedCallback, BarCodeScanner } from 'expo-barcode-scanner'
import { Camera, X } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components/native'
import AppText from './AppText'
import InfoBox from './InfoBox'

import Screen, { ScreenSection } from './layout/Screen'
import ModalWithBackdrop from './ModalWithBackdrop'

interface QRCodeScannerModalProps {
  onClose: () => void
  onQRCodeScan: (data: string) => void
}

const QRCodeScannerModal = ({ onClose, onQRCodeScan }: QRCodeScannerModalProps) => {
  const theme = useTheme()

  const [hasPermission, setHasPermission] = useState<boolean>()
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    }

    getBarCodeScannerPermissions()
  }, [])

  const handleBarCodeScanned: BarCodeScannedCallback = ({ data }) => {
    setScanned(true)
    onQRCodeScan(data)
    onClose()
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
          <BarCodeScannerStyled
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
            onBarCodeScanned={handleBarCodeScanned}
          />
        )}
        {hasPermission === false && (
          <ScreenSection fill>
            <InfoBox title="Camera permissions required" Icon={Camera}>
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

const BarCodeScannerStyled = styled(BarCodeScanner)`
  flex: 1;
`
