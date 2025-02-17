import { AddressHash } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { colord } from 'colord'
import { ArrowDownToLine, CreditCard, Send, Settings } from 'lucide-react'
import { ButtonHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useAnalytics from '@/features/analytics/useAnalytics'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useFetchAddressesHashesWithBalance } from '@/hooks/useAddresses'
import { selectAddressByHash, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { TokenId } from '@/types/tokens'
import { labelColorPalette, useDisplayColor, useHashToColor, walletColorPalette } from '@/utils/colors'

interface ShortcutButtonBaseProps {
  analyticsOrigin: string
  color?: string
  highlight?: boolean
}

export const ShortcutButtonsGroupWallet = ({ ...buttonProps }: ShortcutButtonBaseProps) => {
  const { hash: defaultAddressHash } = useAppSelector(selectDefaultAddress)
  const activeWalletHash = useAppSelector((s) => s.activeWallet.id)
  const color = useDisplayColor(useHashToColor(activeWalletHash), walletColorPalette, 'vivid')

  return (
    <ButtonsContainer>
      <ReceiveButton addressHash={defaultAddressHash} color={color} {...buttonProps} />
      <SendButton addressHash={defaultAddressHash} color={color} {...buttonProps} />
      <BuyButton addressHash={defaultAddressHash} color={color} {...buttonProps} />
    </ButtonsContainer>
  )
}

interface ShortcutButtonsGroupAddressProps extends ShortcutButtonBaseProps {
  addressHash: AddressHash
}

export const ShortcutButtonsGroupAddress = ({ addressHash, ...buttonProps }: ShortcutButtonsGroupAddressProps) => {
  const addressColor = useAppSelector((s) => selectAddressByHash(s, addressHash)?.color)
  const color = useDisplayColor(addressColor, labelColorPalette)

  return (
    <ButtonsContainer>
      <ReceiveButton addressHash={addressHash} {...buttonProps} color={color} />
      <SendButton addressHash={addressHash} {...buttonProps} color={color} />
      <BuyButton addressHash={addressHash} {...buttonProps} color={color} />
      <SettingsButton addressHash={addressHash} {...buttonProps} color={color} />
    </ButtonsContainer>
  )
}

interface ShortcutButtonsGroupTokenProps extends ShortcutButtonBaseProps {
  tokenId: TokenId
}

export const ShortcutButtonsGroupToken = ({ tokenId, ...buttonProps }: ShortcutButtonsGroupTokenProps) => {
  const { hash: defaultAddressHash } = useAppSelector(selectDefaultAddress)

  return (
    <ButtonsContainer>
      <ReceiveButton addressHash={defaultAddressHash} {...buttonProps} />
      <SendButton addressHash={defaultAddressHash} tokenId={tokenId} {...buttonProps} />
      {tokenId === ALPH.id && <BuyButton addressHash={defaultAddressHash} {...buttonProps} />}
    </ButtonsContainer>
  )
}

interface SettingsButtonProps extends ShortcutButtonBaseProps {
  addressHash?: AddressHash
}

const SettingsButton = ({ addressHash, analyticsOrigin, color }: SettingsButtonProps) => {
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
      onClick={addressHash ? () => handleAddressSettingsClick(addressHash) : handleWalletSettingsClick}
      color={color}
    >
      <Settings strokeWidth={1.5} />
      <ButtonText>{t('Settings')}</ButtonText>
    </ShortcutButton>
  )
}

const ReceiveButton = ({ addressHash, analyticsOrigin, color }: ShortcutButtonsGroupAddressProps) => {
  const { sendAnalytics } = useAnalytics()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleReceiveClick = () => {
    dispatch(openModal({ name: 'ReceiveModal', props: { addressHash } }))
    sendAnalytics({ event: 'Receive button clicked', props: { origin: analyticsOrigin } })
  }

  return (
    <ShortcutButton onClick={handleReceiveClick} color={color}>
      <ArrowDownToLine size={22} strokeWidth={1.5} />
      <ButtonText>{t('Receive')}</ButtonText>
    </ShortcutButton>
  )
}

interface SendButtonProps extends ShortcutButtonsGroupAddressProps {
  tokenId?: TokenId
}

const SendButton = ({ addressHash, tokenId, color, analyticsOrigin }: SendButtonProps) => {
  const { sendAnalytics } = useAnalytics()
  const { t } = useTranslation()
  const fromAddress = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const dispatch = useAppDispatch()
  const { data: addressesHashesWithBalance } = useFetchAddressesHashesWithBalance(tokenId)
  const currentNetwork = useCurrentlyOnlineNetworkId()

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

    dispatch(openModal({ name: 'TransferSendModal', props: { initialTxData: { fromAddress, tokenId } } }))
    sendAnalytics({ event: 'Send button clicked', props: { origin: analyticsOrigin } })
  }

  return (
    <ShortcutButton
      data-tooltip-id="default"
      data-tooltip-content={tooltipContent}
      onClick={isDisabled ? undefined : handleSendClick}
      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
      color={color}
    >
      <Send size={22} strokeWidth={1.5} />
      <ButtonText>{t('Send')}</ButtonText>
    </ShortcutButton>
  )
}

const BuyButton = ({ addressHash, analyticsOrigin, color }: ShortcutButtonsGroupAddressProps) => {
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
    <ShortcutButton onClick={handleBuyClick} color={color}>
      <CreditCard size={22} strokeWidth={1.5} />
      <ButtonText>{t('Buy')}</ButtonText>
    </ShortcutButton>
  )
}

interface ShortcutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string
}

const ShortcutButton = (props: ShortcutButtonProps) => <ShortcutButtonStyled {...props} />

const ShortcutButtonStyled = styled.button<{ color?: string }>`
  display: flex;
  margin: 0;
  min-width: 120px;
  flex-direction: column;
  justify-content: center;
  border-radius: var(--radius-huge);
  background-color: ${({ theme, color }) => (color ? colord(color).alpha(0.1).toHex() : theme.bg.primary)};
  color: ${({ theme, color }) =>
    color ? (theme.name === 'light' ? colord(color).darken(0.1).saturate(0.2).toHex() : color) : theme.font.primary};
  gap: 5px;
  font-weight: var(--fontWeight-medium);
  padding: var(--spacing-2) var(--spacing-3);
  cursor: pointer;

  &:hover {
    background-color: ${({ color, theme }) => (color ? colord(color).alpha(0.2).toHex() : theme.bg.highlight)};
  }
`

const ButtonText = styled.div`
  text-align: center;
`

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1;
`
