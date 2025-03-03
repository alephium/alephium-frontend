import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { updateStoredWalletMetadata } from '~/persistent-storage/wallet'
import { walletNameChanged } from '~/store/wallet/walletActions'
import { showExceptionToast } from '~/utils/layout'

const EditWalletNameModal = withModal(({ id }) => {
  const walletName = useAppSelector((s) => s.wallet.name)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

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
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal modalId={id} title={t('Wallet name')}>
      <ScreenSection verticalGap>
        <Input value={name} onChangeText={setName} label={t('New name')} maxLength={24} autoFocus />
        <Button title={t('Save')} onPress={handleSavePress} variant="highlight" />
      </ScreenSection>
    </BottomModal>
  )
})

export default EditWalletNameModal
