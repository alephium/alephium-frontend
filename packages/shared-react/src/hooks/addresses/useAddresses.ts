import { MAXIMAL_GAS_FEE, ONE_DAY_MS } from '@alephium/shared'
import { selectDefaultAddressHash } from '@alephium/shared/store'
import { AddressHash, AddressWithGroup, TokenId } from '@alephium/shared/types'
import { isGrouplessAddress } from '@alephium/shared/utils'
import { ALPH } from '@alephium/token-list'
import { useMemo } from 'react'

import { useFetchLatestTransactionOfEachAddress } from '../../api/apiDataHooks/wallet/useFetchLatestTransactionOfEachAddress'
import { useFetchWalletBalancesByAddress } from '../../api/apiDataHooks/wallet/useFetchWalletBalancesByAddress'
import { useUnsortedAddresses, useUnsortedAddressesHashes } from '../../hooks/addresses/useUnsortedAddresses'
import { useCurrentlyOnlineNetworkId } from '../../network/networkHooks'
import { useSharedSelector } from '../../redux'

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
        [...latestTxs].sort((a, b) => {
          const valA = a.addressHash === defaultAddressHash ? Infinity : a.latestTx?.timestamp ?? 0
          const valB = b.addressHash === defaultAddressHash ? Infinity : b.latestTx?.timestamp ?? 0
          return valB - valA
        }),
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

const ONE_MONTH_IN_MS = 30 * ONE_DAY_MS

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
  const addresses = useUnsortedAddresses()

  const addressesWithEnoughAlphForGas = useMemo(
    () =>
      addresses.filter((address): address is AddressWithGroup => {
        if (isGrouplessAddress(address)) return false // Groupless addresses cannot be used as input for chained txs

        const alphBalance = addressesBalances[address.hash]?.find(({ id }) => id === ALPH.id)

        // TODO: Use dynamic gas fee instead of MAXIMAL_GAS_FEE
        return !!alphBalance && BigInt(alphBalance.availableBalance) >= MAXIMAL_GAS_FEE
      }),
    [addresses, addressesBalances]
  )

  return {
    data: addressesWithEnoughAlphForGas,
    isLoading: isLoadingAddressesBalances
  }
}
