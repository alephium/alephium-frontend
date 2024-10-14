/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { AlertTriangle } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import queryClient from '@/api/queryClient'
import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useAddresses'
import CenteredModal from '@/modals/CenteredModal'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { activeWalletDeleted, walletDeleted } from '@/storage/wallets/walletActions'
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
  const allAddressHashes = useUnsortedAddressesHashes()

  const removeWallet = () => {
    walletStorage.delete(walletId)
    addressMetadataStorage.delete(walletId)

    allAddressHashes.forEach((addressHash) => {
      queryClient.removeQueries({ queryKey: ['address', addressHash] })
    })

    dispatch(walletId === activeWalletId ? activeWalletDeleted() : walletDeleted(walletId))
    dispatch(closeModal({ id }))

    sendAnalytics({ event: 'Deleted wallet' })
  }

  return (
    <CenteredModal title={t('Remove wallet "{{ walletName }}"', { walletName })} id={id} focusMode>
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
        <Paragraph secondary centered>
          <b>{t('Not your keys, not your coins.')}</b>
        </Paragraph>
      </Section>
      <Section inList>
        <Button variant="alert" onClick={removeWallet}>
          {t('CONFIRM REMOVAL')}
        </Button>
      </Section>
    </CenteredModal>
  )
})

export default WalletRemovalModal
