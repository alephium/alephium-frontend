import { activeWalletDeleted } from '@alephium/shared'
import { usePersistQueryClientContext } from '@alephium/shared-react'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { deleteWallet } from '~/persistent-storage/wallet'
import { showExceptionToast } from '~/utils/layout'

interface WalletDeleteModalProps {
  onDelete: () => void
}

const WalletDeleteModal = memo<WalletDeleteModalProps>((props) => {
  const walletName = useAppSelector((s) => s.wallet.name)
  const { t } = useTranslation()

  return (
    <BottomModal2 contentVerticalGap notScrollable>
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
      <WalletDeleteModalContent {...props} />
    </BottomModal2>
  )
})

export default WalletDeleteModal

const WalletDeleteModalContent = ({ onDelete }: WalletDeleteModalProps) => {
  const dispatch = useAppDispatch()
  const walletName = useAppSelector((s) => s.wallet.name)
  const walletId = useAppSelector((s) => s.wallet.id)
  const { resetWalletConnectStorage } = useWalletConnectContext()
  const { t } = useTranslation()
  const { deletePersistedCache } = usePersistQueryClientContext()
  const { dismissModal } = useModalContext()

  const [inputWalletName, setInputWalletName] = useState('')

  const handleDeleteConfirmPress = async () => {
    dispatch(activateAppLoading(t('Deleting')))

    try {
      await deleteWallet()

      onDelete()

      dispatch(activeWalletDeleted())
      resetWalletConnectStorage()
      deletePersistedCache(walletId)
      sendAnalytics({ event: 'Deleted wallet' })
    } catch (error) {
      showExceptionToast(error, t('Error while deleting wallet'))
    } finally {
      dispatch(deactivateAppLoading())
      dismissModal()
    }
  }

  return (
    <>
      <ScreenSection>
        <Input isInModal label={t('Wallet name')} defaultValue={inputWalletName} onChangeText={setInputWalletName} />
      </ScreenSection>
      <ScreenSection>
        <Button
          title={t('Delete')}
          variant="alert"
          onPress={handleDeleteConfirmPress}
          disabled={inputWalletName !== walletName}
          iconProps={{ name: 'trash-outline' }}
        />
      </ScreenSection>
    </>
  )
}
