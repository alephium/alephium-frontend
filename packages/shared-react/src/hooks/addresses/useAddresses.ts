import { AddressHash, MAXIMAL_GAS_FEE, selectDefaultAddressHash, TokenId } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { isGrouplessAddress } from '@alephium/web3'
import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { useFetchLatestTransactionOfEachAddress } from '@/api/apiDataHooks/wallet/useFetchLatestTransactionOfEachAddress'
import { useFetchWalletBalancesByAddress } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesByAddress'
import { useUnsortedAddressesHashes } from '@/hooks/addresses/useUnsortedAddresses'
import { useCurrentlyOnlineNetworkId } from '@/network/useCurrentlyOnlineNetworkId'
import { useSharedSelector } from '@/redux'

export const useFetchAddressesHashesSortedByLastUse = () => {
  const isNetworkOffline = useCurrentlyOnlineNetworkId() === undefined
  const allAddressHashes = useUnsortedAddressesHashes()
  const { data: sortedAddresses, isLoading } = useFetchAddressesHashesSortedByLastUseWithLatestTx()

  const sortedAddressHashes = useMemo(() => sortedAddresses.map(({ addressHash }) => addressHash), [sortedAddresses])

  return {
    data: !isLoading && !isNetworkOffline && sortedAddressHashes.length > 0 ? sortedAddressHashes : allAddressHashes,
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

const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000

export const useFetchAddressesHashesSplitByUseFrequency = () => {
  const isNetworkOffline = useCurrentlyOnlineNetworkId() === undefined
  const allAddressHashes = useUnsortedAddressesHashes()
  const { data: latestTxs, isLoading: isLoading } = useFetchLatestTransactionOfEachAddress()

  const splitAddressHashes = useMemo(() => {
    const frequentlyUsedAddressHashes = []
    let infrequentlyUsedAddressHashes = []

    if (!isNetworkOffline) {
      for (const { addressHash, latestTx } of latestTxs) {
        if (latestTx?.timestamp && latestTx.timestamp > Date.now() - ONE_MONTH_IN_MS) {
          frequentlyUsedAddressHashes.push(addressHash)
        } else {
          infrequentlyUsedAddressHashes.push(addressHash)
        }
      }
    } else {
      infrequentlyUsedAddressHashes = allAddressHashes
    }

    return {
      frequentlyUsedAddressHashes,
      infrequentlyUsedAddressHashes
    }
  }, [allAddressHashes, isNetworkOffline, latestTxs])

  return {
    data: splitAddressHashes,
    isLoading
  }
}

export const useFetchGroupedAddressesWithEnoughAlphForGas = () => {
  const { data: addressesBalances, isLoading: isLoadingAddressesBalances } = useFetchWalletBalancesByAddress()

  const addressesWithEnoughAlphForGas = useMemo(
    () =>
      Object.keys(addressesBalances)
        .filter((addressHash) => !isGrouplessAddress(addressHash)) // Groupless addresses cannot be used as input for chained txs
        .reduce((addressesWithEnoughBalance, addressHash) => {
          const alphBalance = addressesBalances[addressHash]?.find(({ id }) => id === ALPH.id)
          // TODO: Use dynamic gas fee instead of MAXIMAL_GAS_FEE
          if (alphBalance && BigInt(alphBalance.availableBalance) >= MAXIMAL_GAS_FEE) {
            addressesWithEnoughBalance.push(addressHash as AddressHash)
          }

          return addressesWithEnoughBalance
        }, [] as AddressHash[]),
    [addressesBalances]
  )

  return {
    data: addressesWithEnoughAlphForGas,
    isLoading: isLoadingAddressesBalances
  }
}
