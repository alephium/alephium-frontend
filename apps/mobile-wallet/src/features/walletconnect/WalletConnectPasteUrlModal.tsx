import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import SpinnerModal from '~/components/SpinnerModal'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import { useAppDispatch } from '~/hooks/redux'
import { showToast } from '~/utils/layout'

interface WalletConnectPasteUrlModalProps {
  onClose?: () => void
}

const WalletConnectPasteUrlModal = withModal<WalletConnectPasteUrlModalProps>(({ id, onClose }) => {
  const { pairWithDapp } = useWalletConnectContext()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const [inputWcUrl, setInputWcUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (url: string) => {
    setError(!url.startsWith('wc:') ? t('This is not a valid WalletConnect URI') : '')
    setInputWcUrl(url)
  }

  const handleConnect = async () => {
    if (inputWcUrl.startsWith('wc:')) {
      setIsLoading(true)

      await pairWithDapp(inputWcUrl)

      setIsLoading(false)

      onClose && onClose()
      sendAnalytics({ event: 'WC: Connected by manually pasting URI' })
      dispatch(closeModal({ id }))
    } else {
      showToast({
        text1: 'Invalid URI',
        text2: t('This is not a valid WalletConnect URI') + ': ' + inputWcUrl,
        type: 'error'
      })
    }
  }

  return (
    <BottomModal modalId={id} title={t('Connect to dApp')}>
      <ModalContent verticalGap>
        <ScreenSection>
          <AppText color="secondary" size={18}>
            {t('Paste the WalletConnect URI you copied from the dApp')}:
          </AppText>
        </ScreenSection>
        <ScreenSection>
          <Input
            label={t('WalletConnect URI')}
            value={inputWcUrl}
            onChangeText={handleInputChange}
            error={error}
            autoFocus
            showPasteButton
          />
        </ScreenSection>
        <ScreenSection>
          <Button title={t('Connect')} variant="highlight" onPress={handleConnect} disabled={!inputWcUrl || !!error} />
        </ScreenSection>
      </ModalContent>
      <SpinnerModal isActive={isLoading} />
    </BottomModal>
  )
})

export default WalletConnectPasteUrlModal
