import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
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

  const handleInputChange = (url: string) => {
    setError(!url.startsWith('wc:') ? t('This is not a valid WalletConnect URI') : '')
    setInputWcUrl(url)
  }

  const handleConnect = async () => {
    if (inputWcUrl.startsWith('wc:')) {
      dispatch(activateAppLoading(t('Connecting')))

      await pairWithDapp(inputWcUrl)

      dispatch(deactivateAppLoading())

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
    </BottomModal>
  )
})

export default WalletConnectPasteUrlModal
