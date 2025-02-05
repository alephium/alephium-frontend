import { AddressHash } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { ArrowDown, ArrowUp, Lock, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Button from '@/components/Button'
import useAnalytics from '@/features/analytics/useAnalytics'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useFetchAddressesHashesWithBalance } from '@/hooks/useAddresses'
import useWalletLock from '@/hooks/useWalletLock'
import { selectAddressByHash, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'

interface ShortcutButtonBaseProps {
  analyticsOrigin: string
  highlight?: boolean
  solidBackground?: boolean
}

interface ShortcutButtonsGroupWalletProps extends ShortcutButtonBaseProps {
  settings?: boolean
  lock?: boolean
}

export const ShortcutButtonsGroupWallet = ({ lock, settings, ...buttonProps }: ShortcutButtonsGroupWalletProps) => {
  const { hash: defaultAddressHash } = useAppSelector(selectDefaultAddress)

  return (
    <>
      <ReceiveButton addressHash={defaultAddressHash} {...buttonProps} />
      <SendButton addressHash={defaultAddressHash} {...buttonProps} />
      {settings && <SettingsButton {...buttonProps} />}
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
  const dispatch = useAppDispatch()

  const handleReceiveClick = () => {
    dispatch(openModal({ name: 'ReceiveModal', props: { addressHash } }))
    sendAnalytics({ event: 'Receive button clicked', props: { origin: analyticsOrigin } })
  }

  return (
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
  )
}

const SendButton = ({ addressHash, analyticsOrigin, solidBackground, highlight }: ShortcutButtonsGroupAddressProps) => {
  const { sendAnalytics } = useAnalytics()
  const theme = useTheme()
  const { t } = useTranslation()
  const fromAddress = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const dispatch = useAppDispatch()
  const { data: addressesHashesWithBalance } = useFetchAddressesHashesWithBalance()
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

    dispatch(openModal({ name: 'TransferSendModal', props: { initialTxData: { fromAddress } } }))
    sendAnalytics({ event: 'Send button clicked', props: { origin: analyticsOrigin } })
  }

  return (
    <ShortcutButton
      data-tooltip-id="default"
      data-tooltip-content={tooltipContent}
      transparent={!solidBackground}
      role="secondary"
      borderless
      onClick={isDisabled ? undefined : handleSendClick}
      Icon={ArrowUp}
      iconColor={theme.global.highlight}
      iconBackground
      highlight={highlight}
      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
    >
      <ButtonText>{t('Send')}</ButtonText>
    </ShortcutButton>
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
