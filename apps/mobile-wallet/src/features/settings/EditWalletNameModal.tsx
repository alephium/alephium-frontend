import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { updateStoredWalletMetadata } from '~/persistent-storage/wallet'
import { walletNameChanged } from '~/store/wallet/walletActions'
import { showExceptionToast } from '~/utils/layout'

const EditWalletNameModal = memo(() => {
  const { t } = useTranslation()

  return (
    <BottomModal2 notScrollable title={t('Wallet name')}>
      <ScreenSection verticalGap>
        <EditWalletNameModalContent />
      </ScreenSection>
    </BottomModal2>
  )
})

export default EditWalletNameModal

const EditWalletNameModalContent = () => {
  const walletName = useAppSelector((s) => s.wallet.name)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()

  const [name, setName] = useState(walletName)

  const handleSavePress = async () => {
    dispatch(activateAppLoading(t('Saving')))

    try {
      await updateStoredWalletMetadata({ name })
      dispatch(walletNameChanged(name))

      sendAnalytics({ event: 'Wallet: Edited wallet name' })
    } catch (error) {
      const message = 'Could not edit wallet name'

      showExceptionToast(error, t(message))
      sendAnalytics({ type: 'error', message })
    }

    dispatch(deactivateAppLoading())
    dismissModal()
  }

  return (
    <>
      <Input isInModal defaultValue={name} onChangeText={setName} label={t('New name')} maxLength={24} autoFocus />
      <Button title={t('Save')} onPress={handleSavePress} variant="highlight" />
    </>
  )
}
