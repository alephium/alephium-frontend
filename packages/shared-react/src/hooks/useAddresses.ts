import { AddressHash, selectDefaultAddressHash, TokenId } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { useFetchLatestTransactionOfEachAddress } from '@/api/apiDataHooks/wallet/useFetchLatestTransactionOfEachAddress'
import { useFetchWalletBalancesByAddress } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesByAddress'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { useCurrentlyOnlineNetworkId } from '@/network/useCurrentlyOnlineNetworkId'
import { useSharedSelector } from '@/redux'

export const useFetchAddressesHashesSortedByLastUse = () => {
  const isNetworkOffline = useCurrentlyOnlineNetworkId() === undefined
  const allAddressHashes = useUnsortedAddressesHashes()
  const { data: sortedAddresses, isLoading } = useFetchAddressesHashesSortedByLastUseWithLatestTx()

  const sortedAddressHashes = useMemo(() => sortedAddresses.map(({ addressHash }) => addressHash), [sortedAddresses])

  return {
    data: !isLoading && !isNetworkOffline ? sortedAddressHashes : allAddressHashes,
    isLoading
  }
}

export const useFetchAddressesHashesSortedByLastUseWithLatestTx = () => {
  const defaultAddressHash = useSharedSelector(selectDefaultAddressHash)
  const { data: latestTxs, isLoading: isLoadingLatestTxs } = useFetchLatestTransactionOfEachAddress()

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

export const useFetchAddressesHashesWithBalance = (tokenId: TokenId = ALPH.id, addressHashesProp?: AddressHash[]) => {
  const isNetworkOffline = useCurrentlyOnlineNetworkId() === undefined
  const { data: addressesBalances, isLoading: isLoadingAddressesBalances } = useFetchWalletBalancesByAddress()

  const unsortedAddressHashes = useUnsortedAddressesHashes()
  const addressHashes = addressHashesProp ?? unsortedAddressHashes

  const filteredAddressHashes = useMemo(
    () =>
      isNetworkOffline
        ? addressHashes
        : addressHashes.filter((addressHash) => {
            const addressTokenBalance = addressesBalances[addressHash]?.find(({ id }) => id === tokenId)

            return addressTokenBalance && addressTokenBalance.totalBalance !== '0'
          }),
    [addressesBalances, addressHashes, isNetworkOffline, tokenId]
  )

  return {
    data: filteredAddressHashes,
    isLoading: isLoadingAddressesBalances
  }
}

export const useFetchAddressesHashesWithBalanceSortedByLastUse = (tokenId: TokenId = ALPH.id) => {
  const { data: sortedAddresses, isLoading: isLoadingSortedAddresses } = useFetchAddressesHashesSortedByLastUse()
  const { data: addressesBalances, isLoading: isLoadingAddressesWithBalance } = useFetchAddressesHashesWithBalance(
    tokenId,
    sortedAddresses
  )

  return {
    data: addressesBalances,
    isLoading: isLoadingSortedAddresses || isLoadingAddressesWithBalance
  }
}
