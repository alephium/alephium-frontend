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

import { maxBy } from 'lodash'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import Button from '@/components/Button'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import Input from '@/components/Inputs/Input'
import Select from '@/components/Inputs/Select'
import WalletPassphrase from '@/components/Inputs/WalletPassphrase'
import { Section } from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import Paragraph from '@/components/Paragraph'
import ConnectWithLedgerButton from '@/features/ledger/ConnectWithLedgerButton'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { useAppSelector } from '@/hooks/redux'
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

  const walletOptions = wallets.map(({ id, name }) => ({ label: name, value: id }))

  const [selectedWallet, setSelectedWallet] = useState<StoredEncryptedWallet['id']>(
    maxBy(wallets, 'lastUsed')?.id || wallets[0]?.id
  )
  const selectedWalletOption = walletOptions.find((option) => option.value === selectedWallet)
  const [password, setPassword] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [isPassphraseConfirmed, setIsPassphraseConfirmed] = useState(false)

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
      <PanelTitle useLayoutId={false} size="big" centerText>
        {pendingDappConnectionUrl
          ? t('Connect to dApp')
          : isAwaitingSessionRequestApproval
            ? t('Received dApp request')
            : t('Welcome back.')}
      </PanelTitle>
      <ParagraphStyled centered secondary>
        {pendingDappConnectionUrl ||
          t(wallets.length === 1 ? 'Unlock your wallet to continue.' : 'Unlock a wallet to continue.')}
      </ParagraphStyled>
      <SectionStyled inList>
        <Select
          label={t('Wallet')}
          options={walletOptions}
          controlledValue={walletOptions.find((w) => w.value === selectedWallet)}
          onSelect={setSelectedWallet}
          title={t('Select a wallet')}
          id="wallet"
        />
        <Input
          label={t('Password')}
          type="password"
          autoComplete="off"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          id="password"
          autoFocus
        />
      </SectionStyled>
      <ButtonsSection>
        <Button
          onClick={handleUnlock}
          submit
          disabled={!selectedWalletOption || !password || !isPassphraseConfirmed}
          tall
        >
          {t('Unlock')}
        </Button>
        <HorizontalDivider style={{ width: '60%' }} />
        <SecondaryButtonsSection>
          <Button
            onClick={onNewWalletLinkClick}
            role="secondary"
            variant="faded"
            Icon={PlusIcon}
            short
            style={{ width: '80%' }}
          >
            {t('Import or create a wallet')}
          </Button>
          <ConnectWithLedgerButton />
        </SecondaryButtonsSection>
      </ButtonsSection>
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

const SecondaryButtonsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  align-items: center;
`

const WalletPassphraseStyled = styled(WalletPassphrase)`
  margin: 16px 0;
  width: 100%;
  position: fixed;
  bottom: 5px;
  right: 20px;
`

const ParagraphStyled = styled(Paragraph)`
  font-weight: var(--fontWeight-semiBold);
  font-size: 16px;
`
