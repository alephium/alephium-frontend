import { maxBy } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import AlephiumLogo from '@/components/AlephiumLogo'
import Button from '@/components/Button'
import Input from '@/components/Inputs/Input'
import Select from '@/components/Inputs/Select'
import WalletPassphrase from '@/components/Inputs/WalletPassphrase'
import { FloatingPanel, Section } from '@/components/PageComponents/PageContainers'
import ConnectWithLedgerButton from '@/features/ledger/ConnectWithLedgerButton'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { useAppSelector } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'
import { showToast } from '@/storage/global/globalActions'
import { StoredEncryptedWallet } from '@/types/wallet'

interface UnlockPanelProps {
  onNewWalletLinkClick: () => void
}

const UnlockPanel = ({ onNewWalletLinkClick }: UnlockPanelProps) => {
  const { t } = useTranslation()
  const wallets = useAppSelector((state) => state.global.wallets)
  const { unlockWallet } = useWalletLock()
  const { pendingDappConnectionUrl, isAwaitingSessionRequestApproval } = useWalletConnectContext()
  const navigate = useNavigate()

  const walletOptions = wallets.map(({ id, name }) => ({ label: name, value: id }))

  const [selectedWallet, setSelectedWallet] = useState<StoredEncryptedWallet['id']>(
    maxBy(wallets, 'lastUsed')?.id || wallets[0]?.id
  )
  const selectedWalletOption = walletOptions.find((option) => option.value === selectedWallet)
  const [password, setPassword] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [isPassphraseConfirmed, setIsPassphraseConfirmed] = useState(false)

  console.log(pendingDappConnectionUrl)
  console.log(isAwaitingSessionRequestApproval)

  if (pendingDappConnectionUrl) {
    showToast({ type: 'info', text: t('Unlock a wallet to connect to the dApp.'), duration: 'long' })
  }

  if (isAwaitingSessionRequestApproval) {
    showToast({ type: 'info', text: t('Received dApp request'), duration: 'long' })
  }

  if (walletOptions.length === 0) return null

  const handleUnlock = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()

    if (!selectedWalletOption) return

    unlockWallet({
      event: 'unlock',
      walletId: selectedWalletOption.value,
      password,
      passphrase,
      afterUnlock: () => navigate('/wallet/overview')
    })

    setPassphrase('')
    setPassword('')
  }

  return (
    <>
      <FloatingPanel verticalAlign="center" horizontalAlign="center" transparentBg>
        <BrandContainer>
          <AlephiumLogoContainer>
            <AlephiumLogo contrasted />
          </AlephiumLogoContainer>
        </BrandContainer>
        <SectionStyled inList>
          <Select
            label={t('Wallet')}
            options={walletOptions}
            controlledValue={walletOptions.find((w) => w.value === selectedWallet)}
            onSelect={setSelectedWallet}
            title={t('Select a wallet')}
            id="wallet"
            heightSize="big"
          />
          <Input
            label={t('Password')}
            type="password"
            autoComplete="off"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            id="password"
            autoFocus
            heightSize="big"
          />
        </SectionStyled>
        <ButtonsSection>
          <ButtonStyled
            onClick={handleUnlock}
            submit
            disabled={!selectedWalletOption || !password || !isPassphraseConfirmed}
            tall
          >
            {t('Unlock')}
          </ButtonStyled>
          <ButtonStyled onClick={onNewWalletLinkClick} role="secondary" transparent short>
            {t('Import or create a wallet')}
          </ButtonStyled>
          <ConnectWithLedgerButton />
        </ButtonsSection>
      </FloatingPanel>
      <WalletPassphraseStyled
        onPassphraseConfirmed={setPassphrase}
        setIsPassphraseConfirmed={setIsPassphraseConfirmed}
      />
    </>
  )
}

export default UnlockPanel

const SectionStyled = styled(Section)`
  min-width: 328px;
`

const ButtonsSection = styled(SectionStyled)`
  margin-top: 30px;
  gap: 20px;
`

const ButtonStyled = styled(Button)`
  margin-top: 10px;
`

const WalletPassphraseStyled = styled(WalletPassphrase)`
  margin: 10px 0;
  width: 100%;
  position: fixed;
  bottom: 5px;
  right: 20px;
`

const BrandContainer = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: var(--spacing-7);
`

const AlephiumLogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 34px;
  width: 100px;
  height: 100px;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.bg.contrast};
`
