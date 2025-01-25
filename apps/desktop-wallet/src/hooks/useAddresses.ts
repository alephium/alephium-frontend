import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import useFetchLatestTransactionOfEachAddress from '@/api/apiDataHooks/wallet/useFetchLatestTransactionOfEachAddress'
import useFetchWalletBalancesAlphByAddress from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphByAddress'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

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
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const { data: alphBalances, isLoading } = useFetchWalletBalancesAlphByAddress()

  const sortedAddresses = useMemo(() => {
    if (isNetworkOffline || !alphBalances) return allAddressHashes

    // First sort by balance
    const sorted = [...allAddressHashes].sort((a, b) => {
      const balanceA = BigInt(alphBalances[a]?.totalBalance ?? 0)
      const balanceB = BigInt(alphBalances[b]?.totalBalance ?? 0)
      if (balanceA > balanceB) return -1
      if (balanceA < balanceB) return 1
      return 0
    })

    // Then move default address to front if it exists
    if (defaultAddress) {
      const defaultIndex = sorted.indexOf(defaultAddress.hash)
      if (defaultIndex > 0) {
        sorted.unshift(sorted.splice(defaultIndex, 1)[0])
      }
    }

    return sorted
  }, [allAddressHashes, alphBalances, defaultAddress, isNetworkOffline])

  return {
    data: sortedAddresses,
    isLoading
  }
}

export const useFetchAddressesHashesSortedByAddressesLabelAlphabetical = () => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const addressEntities = useAppSelector((s) => s.addresses.entities)

  const sortedAddresses = useMemo(() => {
    // First sort by label
    const sorted = [...allAddressHashes].sort((a, b) => {
      const entityA = addressEntities[a]
      const entityB = addressEntities[b]

      if (entityA?.label && !entityB?.label) return -1
      if (!entityA?.label && entityB?.label) return 1

      if (entityA?.label && entityB?.label) {
        return entityA.label.localeCompare(entityB.label)
      }

      return a.localeCompare(b)
    })

    // Then move default address to front if it exists
    if (defaultAddress) {
      const defaultIndex = sorted.indexOf(defaultAddress.hash)
      if (defaultIndex > 0) {
        sorted.unshift(sorted.splice(defaultIndex, 1)[0])
      }
    }

    return sorted
  }, [allAddressHashes, addressEntities, defaultAddress])

  return {
    data: sortedAddresses
  }
}
