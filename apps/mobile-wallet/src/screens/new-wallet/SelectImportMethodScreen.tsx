import Ionicons from '@expo/vector-icons/Ionicons'
import { StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { cameraToggled } from '~/store/appSlice'
import { qrCodeFromDesktopWalletScanned } from '~/store/walletGenerationSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'

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
      <ScreenSectionStyled centered>
        <IconAndTitle>
          <IconBox style={{ backgroundColor: 'rgba(61, 149, 190, 0.1)' }}>
            <Ionicons size={34} name="desktop" color="rgb(86, 201, 254)" />
          </IconBox>
          <Title size={24} medium>
            {t('Desktop wallet')}
          </Title>
        </IconAndTitle>
        <Subtitle size={16} medium color="secondary">
          {t('Export your wallet directly from the Desktop app! Convenient, quick and secure.')}
        </Subtitle>
        <Button variant="contrast" title={t('Scan the QR code')} onPress={openQRCodeScannerModal} centered />
      </ScreenSectionStyled>
      <ScreenSectionStyled centered>
        <IconAndTitle>
          <IconBox style={{ backgroundColor: 'rgba(185, 111, 26, 0.1)' }}>
            <Ionicons size={34} name="list-outline" color="rgb(255, 147, 21)" />
          </IconBox>
          <Title size={24} medium>
            {t('Secret recovery phrase')}
          </Title>
        </IconAndTitle>
        <Subtitle size={16} medium color="secondary">
          {t('Enter the 24 words of your secret recovery phrase one-by-one.')}
        </Subtitle>
        <Button
          variant="contrast"
          title={t('Type your secret phrase')}
          onPress={() => navigation.navigate('ImportWalletSeedScreen')}
          centered
        />
      </ScreenSectionStyled>
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

const ScreenSectionStyled = styled(ScreenSection)`
  padding: 20px 20px 30px;
  border-radius: 28px;
  border: 1px solid ${({ theme }) => theme.border.primary};
`

const IconAndTitle = styled.View`
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: ${VERTICAL_GAP / 2}px;
`

const Title = styled(AppText)``

const Subtitle = styled(AppText)`
  margin-bottom: ${VERTICAL_GAP}px;
  text-align: center;
`

const IconBox = styled.View`
  width: auto;
  padding: 16px;
  border-radius: 100px;
`
