/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { ADDRESSES_QUERY_LIMIT } from '@alephium/shared'
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

export const useCappedAddressesHashes = () => {
  const allAddressHashes = useUnsortedAddressesHashes()

  const exceedsAddressLimit = allAddressHashes.length > ADDRESSES_QUERY_LIMIT
  const { data: allAddressHashesSorted, isLoading: isLoadingSortedAddresses } = useFetchSortedAddressesHashes({
    skip: !exceedsAddressLimit
  })

  return {
    isCapped: exceedsAddressLimit,
    addressHashes: useMemo(
      () =>
        exceedsAddressLimit
          ? !isLoadingSortedAddresses
            ? allAddressHashesSorted.slice(0, ADDRESSES_QUERY_LIMIT)
            : []
          : allAddressHashes,
      [allAddressHashes, allAddressHashesSorted, exceedsAddressLimit, isLoadingSortedAddresses]
    )
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
