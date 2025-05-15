import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { usePreventScreenCapture } from 'expo-screen-capture'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal2 from '~/features/modals/BottomModal2'
import withModal from '~/features/modals/withModal'
import OrderedTable from '~/features/settings/OrderedTable'
import { dangerouslyExportWalletMnemonic } from '~/persistent-storage/wallet'

interface MnemonicModalProps {
  onVerifyPress?: () => void
}

const MnemonicModal = withModal<MnemonicModalProps>(({ id, onVerifyPress }) => {
  const { t } = useTranslation()
  const { dismiss } = useBottomSheetModal()

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
    dismiss(id)
  }

  return (
    <BottomModal2 notScrollable modalId={id} bottomSheetModalProps={{ stackBehavior: 'replace' }} contentVerticalGap>
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
