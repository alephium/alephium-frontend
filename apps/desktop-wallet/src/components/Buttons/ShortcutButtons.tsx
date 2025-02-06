import { AddressHash } from '@alephium/shared'
import { ArrowDownToLine, CreditCard, Send, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useAnalytics from '@/features/analytics/useAnalytics'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useFetchAddressesHashesWithBalance } from '@/hooks/useAddresses'
import { selectAddressByHash, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

interface ShortcutButtonBaseProps {
  analyticsOrigin: string
  highlight?: boolean
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

const SettingsButton = ({ addressHash, analyticsOrigin }: SettingsButtonProps) => {
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
      role="primary"
      onClick={addressHash ? () => handleAddressSettingsClick(addressHash) : handleWalletSettingsClick}
    >
      <Settings strokeWidth={1.5} />
      <ButtonText>{t('Settings')}</ButtonText>
    </ShortcutButton>
  )
}

const ReceiveButton = ({ addressHash, analyticsOrigin }: ShortcutButtonsGroupAddressProps) => {
  const { sendAnalytics } = useAnalytics()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleReceiveClick = () => {
    dispatch(openModal({ name: 'ReceiveModal', props: { addressHash } }))
    sendAnalytics({ event: 'Receive button clicked', props: { origin: analyticsOrigin } })
  }

  return (
    <ShortcutButton role="primary" onClick={handleReceiveClick}>
      <ArrowDownToLine size={22} strokeWidth={1.5} />
      <ButtonText>{t('Receive')}</ButtonText>
    </ShortcutButton>
  )
}

const SendButton = ({ addressHash, analyticsOrigin }: ShortcutButtonsGroupAddressProps) => {
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
      role="primary"
      onClick={isDisabled ? undefined : handleSendClick}
      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
    >
      <Send size={22} strokeWidth={1.5} />
      <ButtonText>{t('Send')}</ButtonText>
    </ShortcutButton>
  )
}

const BuyButton = ({ addressHash, analyticsOrigin }: ShortcutButtonsGroupAddressProps) => {
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
    <ShortcutButton role="primary" onClick={handleBuyClick}>
      <CreditCard size={22} strokeWidth={1.5} />
      <ButtonText>{t('Buy')}</ButtonText>
    </ShortcutButton>
  )
}

const ShortcutButton = styled.button`
  display: flex;
  margin: 0;
  min-width: 120px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background-color: ${({ theme }) => theme.bg.highlight};
  border: 1px solid ${({ theme }) => (theme.name === 'light' ? theme.border.primary : 'transparent')};
  color: ${({ theme }) => theme.font.primary};
  gap: 5px;
  font-weight: var(--fontWeight-medium);
  padding: 8px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.bg.primary};
  }
`

const ButtonText = styled.div`
  text-align: center;
`

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 1;
`
