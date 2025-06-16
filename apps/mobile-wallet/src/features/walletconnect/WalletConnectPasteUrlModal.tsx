import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import { useAppDispatch } from '~/hooks/redux'
import { showToast } from '~/utils/layout'

const WalletConnectPasteUrlModal = memo<ModalBaseProp>(({ id }) => {
  const { pairWithDapp } = useWalletConnectContext()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { dismissModal } = useModalContext()

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
      sendAnalytics({ event: 'WC: Connected by manually pasting URI' })
      dismissModal()
    } else {
      showToast({
        text1: 'Invalid URI',
        text2: t('This is not a valid WalletConnect URI') + ': ' + inputWcUrl,
        type: 'error'
      })
    }
  }

  return (
    <BottomModal2
      modalId={id}
      title={t('Connect to dApp')}
      contentVerticalGap
      bottomSheetModalProps={{ stackBehavior: 'replace' }}
    >
      <ScreenSection>
        <AppText color="secondary" size={18}>
          {t('Paste the WalletConnect URI you copied from the dApp')}:
        </AppText>
      </ScreenSection>
      <ScreenSection>
        <Input
          isInModal
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
    </BottomModal2>
  )
})

export default WalletConnectPasteUrlModal
