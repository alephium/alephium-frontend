/*
Copyright 2018 - 2024 The Alephium Authors
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

import Ionicons from '@expo/vector-icons/Ionicons'
import { StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Surface from '~/components/layout/Surface'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { cameraToggled } from '~/store/appSlice'
import { qrCodeFromDesktopWalletScanned } from '~/store/walletGenerationSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface SelectImportMethodScreenProps
  extends StackScreenProps<RootStackParamList, 'SelectImportMethodScreen'>,
    ScrollScreenProps {}

export type SelectedWord = {
  word: string
  timestamp: Date
}

const SelectImportMethodScreen = ({ navigation, ...props }: SelectImportMethodScreenProps) => {
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const closeQRCodeScannerModal = () => dispatch(cameraToggled(false))

  const handleQRCodeScan = (scannedData: string) => {
    dispatch(qrCodeFromDesktopWalletScanned(scannedData))

    navigation.navigate('DecryptScannedMnemonicScreen')

    sendAnalytics({ event: 'Scanned QR code from desktop wallet' })
  }

  return (
    <ScrollScreen
      fill
      verticalGap
      contentPaddingTop
      headerOptions={{ headerTitle: 'Import', type: 'stack' }}
      screenTitle={t('Import method')}
      screenIntro={t('Choose how you want to import your wallet.')}
      {...props}
    >
      <ScreenSection fill>
        <SurfaceStyled type="primary">
          <IconBox style={{ backgroundColor: 'rgba(61, 149, 190, 0.1)' }}>
            <Ionicons size={35} name="desktop" color="rgb(86, 201, 254)" />
          </IconBox>
          <Title size={28} medium>
            {t('Desktop wallet')}
          </Title>
          <Subtitle size={16} medium color="secondary">
            {t('Export your wallet directly from the Desktop app! Convenient, quick and secure.')}
          </Subtitle>
          <Button variant="highlight" title={t('Scan the QR code')} onPress={openQRCodeScannerModal} />
        </SurfaceStyled>
      </ScreenSection>
      <ScreenSection fill>
        <SurfaceStyled type="primary">
          <IconBox style={{ backgroundColor: 'rgba(185, 111, 26, 0.1)' }}>
            <Ionicons size={35} name="list-outline" color="rgb(255, 147, 21)" />
          </IconBox>
          <Title size={28} medium>
            {t('Secret recovery phrase')}
          </Title>
          <Subtitle size={16} medium color="secondary">
            {t('Enter the 24 words of your secret recovery phrase one-by-one.')}
          </Subtitle>
          <Button
            variant="highlight"
            title={t('Type your secret phrase')}
            onPress={() => navigation.navigate('ImportWalletSeedScreen')}
          />
        </SurfaceStyled>
      </ScreenSection>
      {isCameraOpen && (
        <QRCodeScannerModal
          onClose={closeQRCodeScannerModal}
          onQRCodeScan={handleQRCodeScan}
          text={t('Scan the animated QR code from the desktop wallet.')}
          qrCodeMode="animated"
        />
      )}
    </ScrollScreen>
  )
}

export default SelectImportMethodScreen

const SurfaceStyled = styled(Surface)`
  padding: ${DEFAULT_MARGIN}px;
`

const Title = styled(AppText)`
  margin: 13px 0;
`

const Subtitle = styled(AppText)`
  margin-bottom: 35px;
`

const IconBox = styled(Surface)`
  background-color: ${({ theme }) => theme.bg.back2};
  width: auto;
  align-self: flex-start;
  padding: ${DEFAULT_MARGIN}px;
`
