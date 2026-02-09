import { colord } from 'colord'
import { ScanLine } from 'lucide-react-native'
import { dataToFrames } from 'qrloop'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import InfoBox from '~/components/InfoBox'
import BottomModal2 from '~/features/modals/BottomModal2'
import QRCodeLoop, { QRCodeLoopProps } from '~/features/seedSigner/QRCodeLoop'

export interface UnsignedTxQrCodeModalProps {
  unsignedTxData: string
}

const UnsignedTxQrCodeModal = memo<UnsignedTxQrCodeModalProps>(({ unsignedTxData }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [frames, setFrames] = useState<QRCodeLoopProps['frames']>([])

  useEffect(() => {
    setFrames(dataToFrames(unsignedTxData, 50, 4))
  }, [unsignedTxData])

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
    </BottomModal2>
  )
})

export default UnsignedTxQrCodeModal
