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
import PrivateModeButton from '@/features/privateMode/PrivateModeButton'
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
      <FloatingPanel verticalAlign="center" horizontalAlign="center" transparentBg>
        <BrandContainer>
          <AlephiumLogoContainer>
            <AlephiumLogo />
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
        </ButtonsSection>
      </FloatingPanel>
      <PrivateModeButtonStyled />
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

const PrivateModeButtonStyled = styled(PrivateModeButton)`
  position: absolute;
  margin: 0;
  bottom: 20px;
  left: 20px;
`
