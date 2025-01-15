import { orderBy } from 'lodash'
import { useMemo } from 'react'
import { AddressHash } from '@alephium/shared'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import useFetchLatestTransactionOfEachAddress from '@/api/apiDataHooks/wallet/useFetchLatestTransactionOfEachAddress'
import useFetchWalletBalancesAlphByAddress from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphByAddress'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddresses, useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'
import useFetchWalletBalancesTokensByAddress from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensByAddress.ts'
import { Address } from '@/types/addresses.ts'

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

export const useFetchAddressesHashesWithBalance = () => {
  const isNetworkOffline = useAppSelector(selectCurrentlyOnlineNetworkId) === undefined
  const allAddressHashes = useUnsortedAddressesHashes()
  const { data: addressesAlphBalances, isLoading } = useFetchWalletBalancesAlphByAddress()

  const filteredAddressHashes = useMemo(
    () =>
      isNetworkOffline
        ? allAddressHashes
        : allAddressHashes.filter(
            (addressHash) =>
              addressesAlphBalances[addressHash] && addressesAlphBalances[addressHash].totalBalance !== '0'
          ),
    [addressesAlphBalances, allAddressHashes, isNetworkOffline]
  )

  return {
    data: filteredAddressHashes,
    isLoading
  }
}

export const useFetchAddressesHashesWithBalanceSortedByAlphWorth = () => {
  const isNetworkOffline = useAppSelector(selectCurrentlyOnlineNetworkId) === undefined
  const allAddressHashes = useUnsortedAddressesHashes()
  const addressEntities = useAppSelector((s) => s.addresses.entities)
  const { data: tokenBalances, isLoading } = useFetchWalletBalancesTokensByAddress()
  console.warn(tokenBalances)
  const sortedAddresses = useMemo(() => {
    if (isNetworkOffline || !tokenBalances) return allAddressHashes

    return [...allAddressHashes].sort((a: AddressHash, b: AddressHash) => {
      const hashA = String(a)
      const hashB = String(b)

      // Default addresses first
      const entityA = Object.values(addressEntities).find((entity) => entity?.hash === hashA)
      const entityB = Object.values(addressEntities).find((entity) => entity?.hash === hashB)

      if (entityA?.isDefault) return -1
      if (entityB?.isDefault) return 1

      const balancesA = tokenBalances[hashA] || []
      const balancesB = tokenBalances[hashB] || []

      const worthA = balancesA.reduce((sum, token) => sum + (Number(token.totalBalance) || 0), 0)
      const worthB = balancesB.reduce((sum, token) => sum + (Number(token.totalBalance) || 0), 0)

      return worthB - worthA
    })
  }, [allAddressHashes, tokenBalances, addressEntities, isNetworkOffline])

  return {
    data: sortedAddresses,
    isLoading
  }
}

export const useFetchAddressesHashesSortedByAddressesLabel = () => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const addressEntities = useAppSelector((s) => s.addresses.entities)

  const sortedAddresses = useMemo(
    () =>
      [...allAddressHashes].sort((a: AddressHash, b: AddressHash) => {
        // Direct access to entities using the hash
        const entityA = addressEntities[a]
        const entityB = addressEntities[b]

        if (entityA?.isDefault) return -1
        if (entityB?.isDefault) return 1

        if (entityA?.label && !entityB?.label) return -1
        if (!entityA?.label && entityB?.label) return 1

        if (entityA?.label && entityB?.label) {
          return entityA.label.localeCompare(entityB.label)
        }

        return a.localeCompare(b)
      }),
    [allAddressHashes, addressEntities]
  )

  return {
    data: sortedAddresses
  }
}
