import { maxBy } from 'lodash'
import { Lock, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import AlephiumLogo from '@/components/AlephiumLogo'
import Button from '@/components/Button'
import Input from '@/components/Inputs/Input'
import Select from '@/components/Inputs/Select'
import { FloatingPanel, Section } from '@/components/PageComponents/PageContainers'
import ConnectWithLedgerButton from '@/features/ledger/ConnectWithLedgerButton'
import { openModal } from '@/features/modals/modalActions'
import WalletPassphraseForm from '@/features/passphrase/WalletPassphraseForm'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'
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
  const dispatch = useAppDispatch()

  const walletOptions = wallets.map(({ id, name }) => ({ label: name, value: id }))

  const [selectedWallet, setSelectedWallet] = useState<StoredEncryptedWallet['id']>(
    maxBy(wallets, 'lastUsed')?.id || wallets[0]?.id
  )
  const selectedWalletOption = walletOptions.find((option) => option.value === selectedWallet)
  const [password, setPassword] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [passphraseConsent, setPassphraseConsent] = useState(false)

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

  const onUsePassphraseClick = () => {
    if (passphraseConsent) {
      setPassphrase('')
      setPassphraseConsent(false)
    } else {
      dispatch(openModal({ name: 'WalletPassphraseDisclaimerModal', props: { onConsentChange: setPassphraseConsent } }))
    }
  }

  return (
    <>
      <FloatingPanel
        verticalAlign="center"
        horizontalAlign="center"
        transparentBg
        style={{ transform: 'translateY(-50px)' }}
      >
        <BrandContainer>
          <AlephiumLogoContainer>
            <AlephiumLogo contrasted />
          </AlephiumLogoContainer>
        </BrandContainer>

        <Title>
          {pendingDappConnectionUrl
            ? t('Connect to dApp')
            : isAwaitingSessionRequestApproval
              ? t('Received dApp request')
              : t('Welcome back.')}
        </Title>

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
          {passphraseConsent && <WalletPassphraseForm onPassphraseConfirmed={setPassphrase} />}
        </SectionStyled>
        <MainAction>
          <ButtonStyled
            onClick={handleUnlock}
            submit
            disabled={!selectedWalletOption || !password || (passphraseConsent && !passphrase)}
            tall
          >
            {t('Unlock')}
          </ButtonStyled>
        </MainAction>
      </FloatingPanel>
      <BottomActions>
        <ButtonStyled onClick={onNewWalletLinkClick} Icon={Plus} role="secondary" short>
          {t('Import or create a wallet')}
        </ButtonStyled>
        <ConnectWithLedgerButton />
        <ButtonStyled onClick={onUsePassphraseClick} Icon={passphraseConsent ? X : Lock} role="secondary" short>
          {t(passphraseConsent ? "Don't use passphrase" : 'Use optional passphrase')}
        </ButtonStyled>
      </BottomActions>
    </>
  )
}

export default UnlockPanel

const SectionStyled = styled(Section)`
  min-width: 328px;
`

const MainAction = styled(SectionStyled)`
  margin-top: 30px;
  gap: 10px;
`

const BottomActions = styled.div`
  position: absolute;
  bottom: 20px;
  right: 0;
  left: 0;
  justify-content: center;
  display: flex;
  gap: 10px;
`

const ButtonStyled = styled(Button)`
  margin-top: 10px;
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
  padding: 26px;
  width: 80px;
  height: 80px;
  border-radius: 80px;
  background-color: ${({ theme }) => theme.bg.contrast};
`

const Title = styled.div`
  font-size: 23px;
  margin: var(--spacing-2);
`
