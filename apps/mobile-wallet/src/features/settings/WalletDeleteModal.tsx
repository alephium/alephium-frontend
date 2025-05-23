import { usePersistQueryClientContext } from '@alephium/shared-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { deleteWallet } from '~/persistent-storage/wallet'
import { walletDeleted } from '~/store/wallet/walletActions'
import { showExceptionToast } from '~/utils/layout'

interface WalletDeleteModalProps {
  onDelete: () => void
}

const WalletDeleteModal = withModal<WalletDeleteModalProps>(({ id, onDelete }) => {
  const dispatch = useAppDispatch()
  const walletName = useAppSelector((s) => s.wallet.name)
  const walletId = useAppSelector((s) => s.wallet.id)
  const { resetWalletConnectStorage } = useWalletConnectContext()
  const { t } = useTranslation()
  const { deletePersistedCache } = usePersistQueryClientContext()

  const [inputWalletName, setInputWalletName] = useState('')

  const handleDeleteConfirmPress = async () => {
    dispatch(activateAppLoading(t('Deleting')))

    try {
      await deleteWallet()

      onDelete()

      dispatch(walletDeleted())
      resetWalletConnectStorage()
      deletePersistedCache(walletId)
      sendAnalytics({ event: 'Deleted wallet' })
    } catch (error) {
      showExceptionToast(error, t('Error while deleting wallet'))
    } finally {
      dispatch(deactivateAppLoading())
      dispatch(closeModal({ id }))
    }
  }

  return (
    <BottomModal modalId={id} contentVerticalGap>
      <ScreenSection>
        <ModalScreenTitle>⚠️ {t('Delete "{{ walletName }}"?', { walletName })}</ModalScreenTitle>
      </ScreenSection>
      <ScreenSection>
        <AppText color="secondary" size={18}>
          {t('Do you really want to delete this wallet from your device?')}
        </AppText>
        <AppText color="secondary" size={18}>
          {t('You can always restore it later using your secret recovery phrase.')}
        </AppText>
        <AppText color="secondary" size={18}>
          {t('If so, please enter the wallet name below, and hit the delete button.')}
        </AppText>
      </ScreenSection>
      <ScreenSection>
        <Input label={t('Wallet name')} value={inputWalletName} onChangeText={setInputWalletName} />
      </ScreenSection>
      <ScreenSection>
        <Button
          title={t('Delete')}
          variant="alert"
          onPress={handleDeleteConfirmPress}
          disabled={inputWalletName !== walletName}
          iconProps={{ name: 'trash' }}
        />
      </ScreenSection>
    </BottomModal>
  )
})

export default WalletDeleteModal
