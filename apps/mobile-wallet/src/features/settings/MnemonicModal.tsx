import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import OrderedTable from '~/features/settings/OrderedTable'
import { useAppSelector } from '~/hooks/redux'
import usePreventScreenCapture from '~/hooks/usePreventScreenCapture'
import { dangerouslyExportWalletMnemonic } from '~/persistent-storage/walletMnemonic'

interface MnemonicModalProps {
  onVerifyPress?: () => void
}

const MnemonicModal = memo<MnemonicModalProps>(({ onVerifyPress }) => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()
  const walletId = useAppSelector((s) => s.wallet.id)

  const [mnemonic, setMnemonic] = useState<string>()

  useEffect(() => {
    try {
      dangerouslyExportWalletMnemonic(walletId).then(setMnemonic)
    } catch (e) {
      if (__DEV__) console.error(e)
    }
  }, [walletId])

  usePreventScreenCapture()

  const handleVerifyButtonPress = () => {
    onVerifyPress && onVerifyPress()
    dismissModal()
  }

  return (
    <BottomModal2 contentVerticalGap>
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
