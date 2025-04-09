import { AddressHash, selectDefaultAddressHash } from '@alephium/shared'
import {
  SkipProp,
  useCurrentlyOnlineNetworkId,
  useFetchAddressesHashesSortedByLastUse,
  useFetchWalletBalancesByAddress,
  useUnsortedAddressesHashes
} from '@alephium/shared-react'
import { useMemo } from 'react'

import { AddressOrder } from '@/features/settings/settingsConstants'
import { useAppSelector } from '@/hooks/redux'

export const useFetchAddressesHashesSortedByPreference = () => {
  const orderPreference = useAppSelector((s) => s.settings.addressOrderPreference)
  const addressesSortedByLabel = useAddressesHashesSortedByLabel()
  const addressesSortedByIndex = useAddressesHashesSortedByIndex()
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
    case AddressOrder.Index:
      return {
        data: addressesSortedByIndex,
        isLoading: false
      }
    default:
      return {
        data: addressesSortedByLastUse,
        isLoading: isLoadingLastUse
      }
  }
}

export const useFetchAddressesHashesSortedByAlphBalance = (props?: SkipProp) => {
  const isNetworkOffline = useCurrentlyOnlineNetworkId() === undefined
  const allAddressHashes = useUnsortedAddressesHashes()
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
  const { data: tokensBalances, isLoading } = useFetchWalletBalancesByAddress()

  const sortedAddresses = useMemo(() => {
    if (isNetworkOffline || !tokensBalances || props?.skip) return allAddressHashes

    return [...allAddressHashes].sort((a, b) => {
      if (a === defaultAddressHash) return -1
      if (b === defaultAddressHash) return 1

      const alphBalanceA = BigInt(
        (tokensBalances[a] && tokensBalances[a].length > 0 && tokensBalances[a][0].totalBalance) || 0
      )
      const alphBalanceB = BigInt(
        (tokensBalances[b] && tokensBalances[b].length > 0 && tokensBalances[b][0].totalBalance) || 0
      )

      if (alphBalanceA > alphBalanceB) return -1
      if (alphBalanceA < alphBalanceB) return 1
      return 0
    })
  }, [allAddressHashes, tokensBalances, defaultAddressHash, isNetworkOffline, props?.skip])

  return {
    data: sortedAddresses,
    isLoading
  }
}

export const useAddressesHashesSortedByLabel = (): AddressHash[] => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
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

export const useAddressesHashesSortedByIndex = (): AddressHash[] => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
  const addressEntities = useAppSelector((s) => s.addresses.entities)

  return useMemo(
    () =>
      [...allAddressHashes].sort((a, b) => {
        if (a === defaultAddressHash) return -1
        if (b === defaultAddressHash) return 1

        const indexA = addressEntities[a]?.index
        const indexB = addressEntities[b]?.index

        if (indexA && !indexB) return -1
        if (!indexA && indexB) return 1

        if (indexA && indexB) {
          return indexA > indexB ? 1 : -1
        }

        return a.localeCompare(b)
      }),
    [allAddressHashes, addressEntities, defaultAddressHash]
  )
}
