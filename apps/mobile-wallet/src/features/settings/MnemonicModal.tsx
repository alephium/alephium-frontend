import { usePreventScreenCapture } from 'expo-screen-capture'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import OrderedTable from '~/features/settings/OrderedTable'
import { dangerouslyExportWalletMnemonic } from '~/persistent-storage/wallet'

interface MnemonicModalProps {
  onVerifyPress?: () => void
}

const MnemonicModal = memo<MnemonicModalProps>(({ onVerifyPress }) => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()

  const [mnemonic, setMnemonic] = useState<string>()

  useEffect(() => {
    try {
      dangerouslyExportWalletMnemonic().then(setMnemonic)
    } catch (e) {
      if (__DEV__) console.error(e)
    }
  }, [])

  usePreventScreenCapture()

  const handleVerifyButtonPress = () => {
    onVerifyPress && onVerifyPress()
    dismissModal()
  }

  return (
    <BottomModal2 notScrollable contentVerticalGap>
      <OrderedTable items={mnemonic ? mnemonic.split(' ') : []} />

      {onVerifyPress && (
        <ScreenSection>
          <Button variant="highlight" title={t('Verify')} onPress={handleVerifyButtonPress} />
        </ScreenSection>
      )}
    </BottomModal2>
  )
})

export default MnemonicModal
