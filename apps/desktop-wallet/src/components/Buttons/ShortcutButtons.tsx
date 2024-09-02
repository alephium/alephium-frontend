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

import { AddressHash } from '@alephium/shared'
import { ArrowDown, ArrowUp, Lock, Settings } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Button from '@/components/Button'
import useAnalytics from '@/features/analytics/useAnalytics'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'
import ModalPortal from '@/modals/ModalPortal'
import ReceiveModal from '@/modals/ReceiveModal'
import SendModalTransfer from '@/modals/SendModals/Transfer'
import { selectAddressByHash, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'

interface ShortcutButtonBaseProps {
  analyticsOrigin: string
  highlight?: boolean
  solidBackground?: boolean
}

interface ShortcutButtonsGroupWalletProps extends ShortcutButtonBaseProps {
  walletSettings?: boolean
  lock?: boolean
}

export const ShortcutButtonsGroupWallet = ({
  lock,
  walletSettings,
  ...buttonProps
}: ShortcutButtonsGroupWalletProps) => {
  const { hash: defaultAddressHash } = useAppSelector(selectDefaultAddress)

  return (
    <>
      <ReceiveButton addressHash={defaultAddressHash} {...buttonProps} />
      <SendButton addressHash={defaultAddressHash} {...buttonProps} />

      {walletSettings && <SettingsButton {...buttonProps} />}
      {lock && <LockButton {...buttonProps} />}
    </>
  )
}

interface ShortcutButtonsGroupAddressProps extends ShortcutButtonBaseProps {
  addressHash: AddressHash
}

export const ShortcutButtonsGroupAddress = ({ addressHash, ...buttonProps }: ShortcutButtonsGroupAddressProps) => (
  <>
    <ReceiveButton addressHash={addressHash} {...buttonProps} />
    <SendButton addressHash={addressHash} {...buttonProps} />
    <SettingsButton addressHash={addressHash} {...buttonProps} />
  </>
)

interface SettingsButtonProps extends ShortcutButtonBaseProps {
  addressHash?: AddressHash
}

const SettingsButton = ({ addressHash, analyticsOrigin, solidBackground, highlight }: SettingsButtonProps) => {
  const { sendAnalytics } = useAnalytics()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleWalletSettingsClick = () => {
    dispatch(openModal({ name: 'SettingsModal', props: {} }))
    sendAnalytics({ event: 'Wallet settings button clicked', props: { origin: analyticsOrigin } })
  }

  const handleAddressSettingsClick = (addressHash: AddressHash) => {
    dispatch(openModal({ name: 'AddressOptionsModal', props: { addressHash } }))
    sendAnalytics({ event: 'Address settings button clicked', props: { origin: analyticsOrigin } })
  }

  return (
    <ShortcutButton
      transparent={!solidBackground}
      role="secondary"
      borderless
      onClick={addressHash ? () => handleAddressSettingsClick(addressHash) : handleWalletSettingsClick}
      Icon={Settings}
      iconBackground
      highlight={highlight}
    >
      <ButtonText>{t('Settings')}</ButtonText>
    </ShortcutButton>
  )
}

const LockButton = ({ analyticsOrigin, solidBackground, highlight }: ShortcutButtonBaseProps) => {
  const { t } = useTranslation()
  const { lockWallet } = useWalletLock()

  return (
    <ShortcutButton
      transparent={!solidBackground}
      role="secondary"
      borderless
      onClick={() => lockWallet(analyticsOrigin)}
      Icon={Lock}
      highlight={highlight}
      iconBackground
    >
      <ButtonText>{t('Lock wallet')}</ButtonText>
    </ShortcutButton>
  )
}

const ReceiveButton = ({
  addressHash,
  analyticsOrigin,
  solidBackground,
  highlight
}: ShortcutButtonsGroupAddressProps) => {
  const { sendAnalytics } = useAnalytics()
  const theme = useTheme()
  const { t } = useTranslation()

  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)

  const handleReceiveClick = () => {
    setIsReceiveModalOpen(true)

    sendAnalytics({ event: 'Receive button clicked', props: { origin: analyticsOrigin } })
  }

  return (
    <>
      <ShortcutButton
        transparent={!solidBackground}
        role="secondary"
        borderless
        onClick={handleReceiveClick}
        Icon={ArrowDown}
        iconColor={theme.global.valid}
        iconBackground
        highlight={highlight}
      >
        <ButtonText>{t('Receive')}</ButtonText>
      </ShortcutButton>

      <ModalPortal>
        {isReceiveModalOpen && <ReceiveModal addressHash={addressHash} onClose={() => setIsReceiveModalOpen(false)} />}
      </ModalPortal>
    </>
  )
}

const SendButton = ({ addressHash, analyticsOrigin, solidBackground, highlight }: ShortcutButtonsGroupAddressProps) => {
  const { sendAnalytics } = useAnalytics()
  const theme = useTheme()
  const { t } = useTranslation()
  const fromAddress = useAppSelector((s) => selectAddressByHash(s, addressHash))

  const [isSendModalOpen, setIsSendModalOpen] = useState(false)

  const handleSendClick = () => {
    setIsSendModalOpen(true)

    sendAnalytics({ event: 'Send button clicked', props: { origin: analyticsOrigin } })
  }

  return (
    <>
      <ShortcutButton
        transparent={!solidBackground}
        role="secondary"
        borderless
        onClick={handleSendClick}
        Icon={ArrowUp}
        iconColor={theme.global.highlight}
        iconBackground
        highlight={highlight}
      >
        <ButtonText>{t('Send')}</ButtonText>
      </ShortcutButton>

      <ModalPortal>
        {isSendModalOpen && fromAddress && (
          <SendModalTransfer initialTxData={{ fromAddress }} onClose={() => setIsSendModalOpen(false)} />
        )}
      </ModalPortal>
    </>
  )
}

const ShortcutButton = styled(Button)<Pick<ShortcutButtonBaseProps, 'highlight'>>`
  border-radius: 0;
  margin: 0;
  width: auto;
  height: 60px;
  box-shadow: none;
  max-width: initial;

  color: ${({ theme }) => theme.font.secondary};

  &:hover {
    color: ${({ theme }) => theme.font.primary};
  }
`

const ButtonText = styled.div`
  font-weight: var(--fontWeight-medium);
  text-align: left;
`
