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

import { Pencil, Trash } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import CheckMark from '@/components/CheckMark'
import InfoBox from '@/components/InfoBox'
import { BoxContainer, Section } from '@/components/PageComponents/PageContainers'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'
import ModalPortal from '@/modals/ModalPortal'
import SecretPhraseModal from '@/modals/SecretPhraseModal'
import EditWalletNameModal from '@/modals/SettingsModal/EditWalletNameModal'
import WalletQRCodeExportModal from '@/modals/WalletQRCodeExportModal'
import WalletRemovalModal from '@/modals/WalletRemovalModal'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { activeWalletDeleted, walletDeleted } from '@/storage/wallets/walletActions'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'
import { ActiveWallet, StoredEncryptedWallet } from '@/types/wallet'

const WalletsSettingsSection = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeWallet = useAppSelector((s) => s.activeWallet)
  const wallets = useAppSelector((s) => s.global.wallets)
  const { sendAnalytics } = useAnalytics()
  const { isWalletUnlocked, lockWallet } = useWalletLock()

  const [walletToRemove, setWalletToRemove] = useState<StoredEncryptedWallet | ActiveWallet>()
  const [isDisplayingSecretModal, setIsDisplayingSecretModal] = useState(false)
  const [isQRCodeModalVisible, setIsQRCodeModalVisible] = useState(false)
  const [isEditWalletNameModalOpen, setIsEditWalletNameModalOpen] = useState(false)

  const handleRemoveWallet = (walletId: string) => {
    walletStorage.delete(walletId)
    addressMetadataStorage.delete(walletId)
    dispatch(walletId === activeWallet.id ? activeWalletDeleted() : walletDeleted(walletId))
    setWalletToRemove(undefined)

    sendAnalytics({ event: 'Deleted wallet' })
  }

  const handleLockCurrentWalletClick = () => lockWallet('settings')

  return (
    <>
      <Section align="flex-start" role="table">
        <h2 tabIndex={0} role="label">
          {t('Wallet list')} ({wallets.length})
        </h2>
        <BoxContainerStyled role="rowgroup">
          {wallets.map((wallet) => (
            <WalletItem
              key={wallet.id}
              wallet={wallet}
              isCurrent={wallet.id === activeWallet.id}
              onWalletDelete={setWalletToRemove}
              isPassphraseUsed={wallet.id === activeWallet.id && activeWallet.isPassphraseUsed}
            />
          ))}
        </BoxContainerStyled>
      </Section>
      {isWalletUnlocked && (
        <CurrentWalletSection align="flex-start">
          <h2>{t('Current wallet')}</h2>
          <InfoBox label={t('Wallet name')} short>
            <CurrentWalletBox>
              <WalletName>{activeWallet.name}</WalletName>
              <Button
                aria-label={t('Delete')}
                tabIndex={0}
                squared
                role="secondary"
                transparent
                borderless
                onClick={() => setIsEditWalletNameModalOpen(true)}
              >
                <Pencil size={15} />
              </Button>
            </CurrentWalletBox>
          </InfoBox>
          <ActionButtons>
            <Button role="secondary" onClick={handleLockCurrentWalletClick}>
              {t('Lock current wallet')}
            </Button>

            <ButtonTooltipWrapper
              data-tooltip-id="default"
              data-tooltip-content={
                activeWallet.isPassphraseUsed ? t('To export this wallet use it without a passphrase') : ''
              }
            >
              <Button
                role="secondary"
                onClick={() => setIsQRCodeModalVisible(true)}
                disabled={activeWallet.isPassphraseUsed}
              >
                {t('Export current wallet')}
              </Button>
            </ButtonTooltipWrapper>

            <Button role="secondary" variant="alert" onClick={() => setIsDisplayingSecretModal(true)}>
              {t('Show your secret recovery phrase')}
            </Button>

            <ButtonTooltipWrapper
              data-tooltip-id="default"
              data-tooltip-content={
                activeWallet.isPassphraseUsed ? t('To delete this wallet use it without a passphrase') : ''
              }
            >
              <Button
                variant="alert"
                onClick={() => setWalletToRemove(activeWallet as ActiveWallet)}
                disabled={activeWallet.isPassphraseUsed}
              >
                {t('Remove current wallet')}
              </Button>
            </ButtonTooltipWrapper>
          </ActionButtons>
        </CurrentWalletSection>
      )}
      <ModalPortal>
        {isDisplayingSecretModal && <SecretPhraseModal onClose={() => setIsDisplayingSecretModal(false)} />}
        {isQRCodeModalVisible && <WalletQRCodeExportModal onClose={() => setIsQRCodeModalVisible(false)} />}
        {isEditWalletNameModalOpen && <EditWalletNameModal onClose={() => setIsEditWalletNameModalOpen(false)} />}
        {walletToRemove && (
          <WalletRemovalModal
            walletName={walletToRemove.name}
            onClose={() => setWalletToRemove(undefined)}
            onConfirm={() => handleRemoveWallet(walletToRemove.id)}
          />
        )}
      </ModalPortal>
    </>
  )
}

interface WalletItemProps {
  wallet: StoredEncryptedWallet
  isCurrent: boolean
  onWalletDelete: (wallet: StoredEncryptedWallet) => void
  isPassphraseUsed?: boolean
}

const WalletItem = ({ wallet, isCurrent, onWalletDelete, isPassphraseUsed }: WalletItemProps) => {
  const { t } = useTranslation()
  const [isShowingDeleteButton, setIsShowingDeleteButton] = useState(false)

  return (
    <WalletItemContainer
      role="row"
      onMouseEnter={() => setIsShowingDeleteButton(true)}
      onMouseLeave={() => setIsShowingDeleteButton(false)}
    >
      <WalletName role="cell" tabIndex={0} onFocus={() => setIsShowingDeleteButton(true)}>
        {wallet.name}
        {isCurrent && <CheckMark />}
      </WalletName>

      <div
        data-tooltip-id="default"
        data-tooltip-content={isPassphraseUsed ? t('To delete this wallet use it without a passphrase') : ''}
      >
        <ButtonStyled
          aria-label={t('Delete')}
          tabIndex={0}
          squared
          role="secondary"
          transparent
          borderless
          onClick={() => onWalletDelete(wallet)}
          onBlur={() => setIsShowingDeleteButton(false)}
          disabled={!isShowingDeleteButton || isPassphraseUsed}
          isVisible={isShowingDeleteButton}
          Icon={Trash}
        />
      </div>
    </WalletItemContainer>
  )
}

export default WalletsSettingsSection

const WalletItemContainer = styled.div`
  display: flex;
  align-items: center;
  height: var(--inputHeight);
  padding: 0 var(--spacing-3);
  gap: 10px;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const WalletName = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
`

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const CurrentWalletSection = styled(Section)`
  margin-top: var(--spacing-4);
`

const CurrentWalletBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ButtonStyled = styled(Button)<{ isVisible: boolean }>`
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)} !important;
`

const BoxContainerStyled = styled(BoxContainer)`
  margin-top: var(--spacing-2);
`

const ButtonTooltipWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`
