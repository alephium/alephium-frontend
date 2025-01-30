import { AddressHash } from '@alephium/shared'
import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import useFetchLatestTransactionOfEachAddress from '@/api/apiDataHooks/wallet/useFetchLatestTransactionOfEachAddress'
import useFetchWalletBalancesAlphByAddress from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphByAddress'
import { AddressOrder } from '@/features/settings/settingsConstants'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

export const useFetchAddressesHashesSortedByPreference = () => {
  const orderPreference = useAppSelector((s) => s.settings.addressOrderPreference)
  const addressesSortedByLabel = useAddressesHashesSortedByLabel()
  const { data: addressesSortedByLastUse, isLoading: isLoadingLastUse } = useFetchAddressesHashesSortedByLastUse()
  const { data: addressesSortedByAlphBalance, isLoading: isLoadingAlphBalance } =
    useFetchAddressesHashesSortedByAlphBalance({
      skip: orderPreference !== AddressOrder.AlphBalance
    })

  switch (orderPreference) {
    case AddressOrder.Label:
      return {
        data: addressesSortedByLabel,
        isLoading: false
      }
    case AddressOrder.AlphBalance:
      return {
        data: addressesSortedByAlphBalance,
        isLoading: isLoadingAlphBalance
      }
    default:
      return {
        data: addressesSortedByLastUse,
        isLoading: isLoadingLastUse
      }
  }
}

export const useFetchAddressesHashesSortedByLastUse = (props?: SkipProp) => {
  const isNetworkOffline = useAppSelector(selectCurrentlyOnlineNetworkId) === undefined
  const allAddressHashes = useUnsortedAddressesHashes()
  const { data: sortedAddresses, isLoading } = useFetchAddressesHashesSortedByLastUseWithLatestTx(props)

  const sortedAddressHashes = useMemo(() => sortedAddresses.map(({ addressHash }) => addressHash), [sortedAddresses])

  return {
    data: !isLoading && !props?.skip && !isNetworkOffline ? sortedAddressHashes : allAddressHashes,
    isLoading
  }
}

export const useFetchAddressesHashesSortedByLastUseWithLatestTx = (props?: SkipProp) => {
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

export const useFetchAddressesHashesSortedByAlphBalance = (props?: SkipProp) => {
  const isNetworkOffline = useAppSelector(selectCurrentlyOnlineNetworkId) === undefined
  const allAddressHashes = useUnsortedAddressesHashes()
  const defaultAddressHash = useAppSelector((s) => selectDefaultAddress(s).hash)
  const { data: alphBalances, isLoading } = useFetchWalletBalancesAlphByAddress()

  const sortedAddresses = useMemo(() => {
    if (isNetworkOffline || !alphBalances || props?.skip) return allAddressHashes

    return [...allAddressHashes].sort((a, b) => {
      if (a === defaultAddressHash) return -1
      if (b === defaultAddressHash) return 1

      const balanceA = BigInt(alphBalances[a]?.totalBalance ?? 0)
      const balanceB = BigInt(alphBalances[b]?.totalBalance ?? 0)

      if (balanceA > balanceB) return -1
      if (balanceA < balanceB) return 1
      return 0
    })
  }, [allAddressHashes, alphBalances, defaultAddressHash, isNetworkOffline, props?.skip])

  return {
    data: sortedAddresses,
    isLoading
  }
}

export const useAddressesHashesSortedByLabel = (): AddressHash[] => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const defaultAddressHash = useAppSelector((s) => selectDefaultAddress(s).hash)
  const addressEntities = useAppSelector((s) => s.addresses.entities)

  return useMemo(
    () =>
      [...allAddressHashes].sort((a, b) => {
        if (a === defaultAddressHash) return -1
        if (b === defaultAddressHash) return 1

        const labelA = addressEntities[a]?.label
        const labelB = addressEntities[b]?.label

        if (labelA && !labelB) return -1
        if (!labelA && labelB) return 1

        if (labelA && labelB) {
          return labelA.localeCompare(labelB)
        }

        return a.localeCompare(b)
      }),
    [allAddressHashes, addressEntities, defaultAddressHash]
  )
}
