import { usePreventScreenCapture } from 'expo-screen-capture'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import OrderedTable from '~/features/settings/OrderedTable'
import { useAppDispatch } from '~/hooks/redux'
import { dangerouslyExportWalletMnemonic } from '~/persistent-storage/wallet'

interface MnemonicModalProps {
  onVerifyPress?: () => void
}

const MnemonicModal = withModal<MnemonicModalProps>(({ id, onVerifyPress }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

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
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal modalId={id}>
      <ModalContent verticalGap>
        <ScreenSection fill>
          <OrderedTable items={mnemonic ? mnemonic.split(' ') : []} />
        </ScreenSection>
        {onVerifyPress && (
          <ScreenSection>
            <Button variant="highlight" title={t('Verify')} onPress={handleVerifyButtonPress} />
          </ScreenSection>
        )}
      </ModalContent>
    </BottomModal>
  )
})

export default MnemonicModal
