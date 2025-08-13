import { keyring } from '@alephium/keyring'
import { activeWalletDeleted } from '@alephium/shared'
import { usePersistQueryClientContext } from '@alephium/shared-react'
import { AlertTriangle } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { walletDeleted } from '@/storage/wallets/walletActions'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'

export interface WalletRemovalModalProps {
  walletId: string
  walletName: string
}

const WalletRemovalModal = memo(({ id, walletId, walletName }: ModalBaseProp & WalletRemovalModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const { deletePersistedCache } = usePersistQueryClientContext()

  const removeWallet = () => {
    walletStorage.delete(walletId)
    addressMetadataStorage.delete(walletId)

    deletePersistedCache(walletId)

    if (activeWalletId === walletId) {
      keyring.clear()
    }

    dispatch(walletId === activeWalletId ? activeWalletDeleted() : walletDeleted(walletId))
    dispatch(closeModal({ id }))

    sendAnalytics({ event: 'Deleted wallet' })
  }

  return (
    <CenteredModal title={t('Remove wallet "{{ walletName }}"', { walletName })} id={id} focusMode hasFooterButtons>
      <Section>
        <AlertTriangle size={60} color={theme.global.alert} style={{ marginBottom: 35 }} />
      </Section>
      <Section>
        <InfoBox
          importance="alert"
          text={t(
            'Please make sure to have your recovery phrase saved and stored somewhere secure to restore your wallet in the future. Without the recovery phrase, your wallet will be unrecoverable and permanently lost.'
          )}
        />
        <Paragraph centered>
          <b>{t('Not your keys, not your coins.')}</b>
        </Paragraph>
      </Section>

      <ModalFooterButtons>
        <ModalFooterButton variant="alert" onClick={removeWallet}>
          {t('CONFIRM REMOVAL')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
})

export default WalletRemovalModal
