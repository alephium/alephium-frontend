import { AddressHash } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'

import useFetchAddressBalances from '@/api/apiDataHooks/address/useFetchAddressBalances'
import useAnalytics from '@/features/analytics/useAnalytics'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useFetchAddressesHashesWithBalance } from '@/hooks/useAddresses'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { TokenId } from '@/types/tokens'

interface UseSendButtonProps {
  fromAddressHash: AddressHash
  toAddressHash?: AddressHash
  tokenId?: TokenId
  analyticsOrigin: string
}

const useSendButton = ({ fromAddressHash, toAddressHash, tokenId, analyticsOrigin }: UseSendButtonProps) => {
  const { sendAnalytics } = useAnalytics()
  const { t } = useTranslation()
  const fromAddress = useAppSelector((s) => selectAddressByHash(s, fromAddressHash))
  const dispatch = useAppDispatch()
  const { data: addressesHashesWithBalance } = useFetchAddressesHashesWithBalance(tokenId)
  const { data: tokensBalances } = useFetchAddressBalances({ addressHash: fromAddressHash })
  const currentNetwork = useCurrentlyOnlineNetworkId()

  const isOffline = currentNetwork === undefined
  const isDisabled = addressesHashesWithBalance.length === 0 || isOffline
  const isTestnetOrDevnet = currentNetwork === 1 || currentNetwork === 4
  const tooltipContent = isDisabled
    ? isTestnetOrDevnet
      ? t('The wallet is empty. Use the faucet in the developer tools in the app settings.')
      : isOffline
        ? t('The wallet is offline.')
        : t('To send funds you first need to load your wallet with some.')
    : undefined

  const handleClick = () => {
    if (isDisabled || !fromAddress) return

    const sendToken = tokenId ?? (tokensBalances?.length === 1 ? tokensBalances[0].id : undefined)

    dispatch(
      openModal({
        name: 'TransferSendModal',
        props: { initialTxData: { fromAddress, toAddress: toAddressHash, tokenId: sendToken } }
      })
    )
    sendAnalytics({ event: 'Send button clicked', props: { origin: analyticsOrigin } })
  }

  return {
    tooltipContent,
    handleClick: isDisabled ? undefined : handleClick,
    cursor: isDisabled ? 'not-allowed' : 'pointer'
  }
}

export default useSendButton
