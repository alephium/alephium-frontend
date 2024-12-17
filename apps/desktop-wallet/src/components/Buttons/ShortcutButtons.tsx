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
import { colord } from 'colord'
import { ArrowDownToLine, CreditCard, Send, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import useAnalytics from '@/features/analytics/useAnalytics'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useFetchAddressesHashesWithBalance } from '@/hooks/useAddresses'
import { selectAddressByHash, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

interface ShortcutButtonBaseProps {
  analyticsOrigin: string
  highlight?: boolean
  solidBackground?: boolean
}

interface ShortcutButtonsGroupWalletProps extends ShortcutButtonBaseProps {
  settings?: boolean
  lock?: boolean
}

export const ShortcutButtonsGroupWallet = ({ ...buttonProps }: ShortcutButtonsGroupWalletProps) => {
  const { hash: defaultAddressHash } = useAppSelector(selectDefaultAddress)

  return (
    <ButtonsContainer>
      <ReceiveButton addressHash={defaultAddressHash} {...buttonProps} />
      <SendButton addressHash={defaultAddressHash} {...buttonProps} />
      <BuyButton addressHash={defaultAddressHash} {...buttonProps} />
    </ButtonsContainer>
  )
}

interface ShortcutButtonsGroupAddressProps extends ShortcutButtonBaseProps {
  addressHash: AddressHash
}

export const ShortcutButtonsGroupAddress = ({ addressHash, ...buttonProps }: ShortcutButtonsGroupAddressProps) => (
  <ButtonsContainer>
    <ReceiveButton addressHash={addressHash} {...buttonProps} />
    <SendButton addressHash={addressHash} {...buttonProps} />
    <BuyButton addressHash={addressHash} {...buttonProps} />
    <SettingsButton addressHash={addressHash} {...buttonProps} />
  </ButtonsContainer>
)

interface SettingsButtonProps extends ShortcutButtonBaseProps {
  addressHash?: AddressHash
}

const SettingsButton = ({ addressHash, analyticsOrigin, solidBackground }: SettingsButtonProps) => {
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
      role="primary"
      onClick={addressHash ? () => handleAddressSettingsClick(addressHash) : handleWalletSettingsClick}
      Icon={Settings}
    >
      <ButtonText>{t('Settings')}</ButtonText>
    </ShortcutButton>
  )
}

const ReceiveButton = ({ addressHash, analyticsOrigin, solidBackground }: ShortcutButtonsGroupAddressProps) => {
  const { sendAnalytics } = useAnalytics()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleReceiveClick = () => {
    dispatch(openModal({ name: 'ReceiveModal', props: { addressHash } }))
    sendAnalytics({ event: 'Receive button clicked', props: { origin: analyticsOrigin } })
  }

  return (
    <ShortcutButton transparent={!solidBackground} role="primary" onClick={handleReceiveClick} Icon={ArrowDownToLine}>
      <ButtonText>{t('Receive')}</ButtonText>
    </ShortcutButton>
  )
}

const SendButton = ({ addressHash, analyticsOrigin, solidBackground }: ShortcutButtonsGroupAddressProps) => {
  const { sendAnalytics } = useAnalytics()
  const { t } = useTranslation()
  const fromAddress = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const dispatch = useAppDispatch()
  const { data: addressesHashesWithBalance } = useFetchAddressesHashesWithBalance()
  const currentNetwork = useAppSelector(selectCurrentlyOnlineNetworkId)

  if (!fromAddress) return null

  const isDisabled = addressesHashesWithBalance.length === 0
  const isTestnetOrDevnet = currentNetwork === 1 || currentNetwork === 4
  const tooltipContent = isDisabled
    ? isTestnetOrDevnet
      ? t('The wallet is empty. Use the faucet in the developer tools in the app settings.')
      : t('To send funds you first need to load your wallet with some.')
    : undefined

  const handleSendClick = () => {
    if (isDisabled) return

    dispatch(openModal({ name: 'TransferSendModal', props: { initialTxData: { fromAddress } } }))
    sendAnalytics({ event: 'Send button clicked', props: { origin: analyticsOrigin } })
  }

  return (
    <ShortcutButton
      data-tooltip-id="default"
      data-tooltip-content={tooltipContent}
      transparent={!solidBackground}
      role="primary"
      onClick={isDisabled ? undefined : handleSendClick}
      Icon={Send}
      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
    >
      <ButtonText>{t('Send')}</ButtonText>
    </ShortcutButton>
  )
}

const BuyButton = ({ addressHash, analyticsOrigin, solidBackground, highlight }: ShortcutButtonsGroupAddressProps) => {
  const { sendAnalytics } = useAnalytics()
  const { t } = useTranslation()
  const fromAddress = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const dispatch = useAppDispatch()

  if (!fromAddress) return null

  const handleBuyClick = () => {
    dispatch(openModal({ name: 'BuyModal', props: { addressHash } }))
    sendAnalytics({ event: 'Send button clicked', props: { origin: analyticsOrigin } })
  }

  return (
    <ShortcutButton transparent={!solidBackground} role="primary" onClick={handleBuyClick} Icon={CreditCard}>
      <ButtonText>{t('Buy')}</ButtonText>
    </ShortcutButton>
  )
}

const ShortcutButton = styled(Button)`
  margin: 0;
  min-width: 120px;
  background-color: ${({ theme }) => colord(theme.bg.contrast).alpha(0.8).toHex()};
  filter: saturate(120%) contrast(120%);
  backdrop-filter: blur(10px) brightness(0.7) saturate(10);
`

const ButtonText = styled.div`
  font-weight: var(--fontWeight-semiBold);
`

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`
