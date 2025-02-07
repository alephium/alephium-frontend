import { ALPH } from '@alephium/token-list'
import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import useFetchLatestTransactionOfEachAddress from '@/api/apiDataHooks/wallet/useFetchLatestTransactionOfEachAddress'
import useFetchWalletBalancesAlphByAddress from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphByAddress'
import useFetchWalletBalancesTokensByAddress from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensByAddress'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'
import { TokenId } from '@/types/tokens'

export const useFetchSortedAddressesHashes = (props?: SkipProp) => {
  const isNetworkOffline = useAppSelector(selectCurrentlyOnlineNetworkId) === undefined
  const allAddressHashes = useUnsortedAddressesHashes()
  const { data: sortedAddresses, isLoading } = useFetchSortedAddressesHashesWithLatestTx(props)

  const sortedAddressHashes = useMemo(() => sortedAddresses.map(({ addressHash }) => addressHash), [sortedAddresses])

  return {
    data: !isLoading && !props?.skip && !isNetworkOffline ? sortedAddressHashes : allAddressHashes,
    isLoading
  }
}

export const useFetchSortedAddressesHashesWithLatestTx = (props?: SkipProp) => {
  const { hash: defaultAddressHash } = useAppSelector(selectDefaultAddress)
  const { data: latestTxs, isLoading: isLoadingLatestTxs } = useFetchLatestTransactionOfEachAddress(props)

  return {
    data: useMemo(
      () =>
        orderBy(
          latestTxs,
          ({ addressHash, latestTx }) => (addressHash === defaultAddressHash ? undefined : latestTx?.timestamp ?? 0),
          'desc'
        ),
      [latestTxs, defaultAddressHash]
    ),
    isLoading: isLoadingLatestTxs
  }
}

export const useFetchAddressesHashesWithBalance = (tokenId?: TokenId) => {
  const isNetworkOffline = useAppSelector(selectCurrentlyOnlineNetworkId) === undefined
  const allAddressHashes = useUnsortedAddressesHashes()
  const { data: addressesAlphBalances, isLoading: isLoadingAlphBalances } = useFetchWalletBalancesAlphByAddress()
  const { data: addressesTokenBalances, isLoading: isLoadingTokenBalances } = useFetchWalletBalancesTokensByAddress()

  const filteredAddressHashes = useMemo(
    () =>
      isNetworkOffline
        ? allAddressHashes
        : allAddressHashes.filter((addressHash) => {
            if (!tokenId || tokenId === ALPH.id) {
              return addressesAlphBalances[addressHash] && addressesAlphBalances[addressHash].totalBalance !== '0'
            }

            const addressTokenBalance = addressesTokenBalances[addressHash]?.find(({ id }) => id === tokenId)

            return addressTokenBalance && addressTokenBalance.totalBalance !== '0'
          }),
    [addressesAlphBalances, addressesTokenBalances, allAddressHashes, isNetworkOffline, tokenId]
  )

  return {
    data: filteredAddressHashes,
    isLoading: isLoadingAlphBalances || isLoadingTokenBalances
  }
}
