import { Pencil, Trash } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import ButtonTooltipWrapper from '@/components/Buttons/ButtonTooltipWrapper'
import CheckMark from '@/components/CheckMark'
import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import { useLedger } from '@/features/ledger/useLedger'
import { openModal } from '@/features/modals/modalActions'
import WalletQRCodeExportButton from '@/features/walletExport/qrCodeExport/WalletQRCodeExportButton'
import WalletSecretPhraseExportButton from '@/features/walletExport/secretPhraseExport/WalletSecretPhraseExportButton'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'
import { StoredEncryptedWallet } from '@/types/wallet'

const WalletsSettingsSection = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)
  const isPassphraseUsed = useAppSelector((s) => s.activeWallet.isPassphraseUsed)
  const wallets = useAppSelector((s) => s.global.wallets)
  const { isWalletUnlocked, lockWallet } = useWalletLock()
  const { isLedger } = useLedger()

  const openWalletRemoveModal = (walletId: string, walletName: string) => {
    dispatch(openModal({ name: 'WalletRemovalModal', props: { walletId, walletName } }))
  }

  const handleLockCurrentWalletClick = () => lockWallet('settings')

  const openEditWalletNameModal = () => dispatch(openModal({ name: 'EditWalletNameModal' }))

  return (
    <>
      {(wallets.length > 1 || !isWalletUnlocked) && (
        <Section align="flex-start" role="table">
          <h2>{t('Wallet list')}</h2>
          <BoxContainerStyled role="rowgroup">
            {wallets.map((wallet) => (
              <WalletItem
                key={wallet.id}
                wallet={wallet}
                isCurrent={wallet.id === activeWalletId}
                onWalletDelete={() => openWalletRemoveModal(wallet.id, wallet.name)}
                isPassphraseUsed={wallet.id === activeWalletId && isPassphraseUsed}
              />
            ))}
          </BoxContainerStyled>
        </Section>
      )}
      {isWalletUnlocked && activeWalletId && activeWalletName && (
        <CurrentWalletSection align="flex-start">
          <h2>{t('Current wallet')}</h2>
          <InfoBoxStyled label={t('Wallet name')} short>
            <CurrentWalletBox>
              <WalletName>{activeWalletName}</WalletName>
              {!isLedger && (
                <Button
                  aria-label={t('Delete')}
                  tabIndex={0}
                  circle
                  role="secondary"
                  transparent
                  onClick={openEditWalletNameModal}
                >
                  <Pencil size={15} />
                </Button>
              )}
            </CurrentWalletBox>
          </InfoBoxStyled>
          <ActionButtons>
            <Button role="secondary" onClick={handleLockCurrentWalletClick}>
              {t('Lock current wallet')}
            </Button>

            {!isLedger && (
              <>
                <WalletQRCodeExportButton />

                <WalletSecretPhraseExportButton />

                <ButtonTooltipWrapper
                  data-tooltip-id="default"
                  data-tooltip-content={isPassphraseUsed ? t('To delete this wallet use it without a passphrase') : ''}
                >
                  <Button
                    variant="alert"
                    onClick={() => openWalletRemoveModal(activeWalletId, activeWalletName)}
                    disabled={isPassphraseUsed}
                  >
                    {t('Remove current wallet')}
                  </Button>
                </ButtonTooltipWrapper>
              </>
            )}
          </ActionButtons>
        </CurrentWalletSection>
      )}
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
          circle
          role="secondary"
          transparent
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
  font-size: 13px;
  justify-content: space-between;
`

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const CurrentWalletSection = styled(Section)`
  margin-top: var(--spacing-4);

  &:first-child {
    margin-top: 0;
  }
`

const CurrentWalletBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ButtonStyled = styled(Button)<{ isVisible: boolean }>`
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)} !important;
`

const BoxContainerStyled = styled.div`
  width: 100%;
`

const InfoBoxStyled = styled(InfoBox)`
  margin-top: var(--spacing-2);
`
