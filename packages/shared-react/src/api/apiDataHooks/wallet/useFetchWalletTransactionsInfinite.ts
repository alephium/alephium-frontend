import { AddressHash } from '@alephium/shared/types'
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { useFetchLatestTransactionOfEachAddress } from '../../../api/apiDataHooks/wallet/useFetchLatestTransactionOfEachAddress'
import {
  addressLatestTransactionQuery,
  AddressLatestTransactionQueryFnData,
  walletTransactionsInfiniteQuery
} from '../../../api/queries/transactionQueries'
import { queryClient } from '../../../api/queryClient'
import { refreshWalletTransactions } from '../../../api/queryInvalidation'
import { useUnsortedAddressesHashes } from '../../../hooks/addresses/useUnsortedAddresses'
import { useIsExplorerOnline, useNetworkId } from '../../../network/networkHooks'

// Comparing against the whole fetched set rather than against its newest transaction, because an address can receive
// one that is older than another address's newest and would otherwise stay hidden.
const findAddressesWithNewTxs = (
  latestTxOfEachAddress: AddressLatestTransactionQueryFnData[],
  fetchedTxHashes: Set<string>
) =>
  latestTxOfEachAddress
    .filter(({ latestTx }) => latestTx !== undefined && !fetchedTxHashes.has(latestTx.hash))
    .map(({ addressHash }) => addressHash)

// The pull-to-refresh path. It reads the poll back out of the cache rather than out of a component, because it runs
// right after awaiting that same poll and any value it had closed over beforehand would be the pre-refresh one.
export const refreshWalletTransactionsFromCache = (addressHashes: AddressHash[], networkId: number) => {
  const walletList = queryClient.getQueryData<InfiniteData<{ pageTransactions: Array<{ hash: string }> }>>(
    walletTransactionsInfiniteQuery({ addressHashes, networkId, isExplorerOnline: true }).queryKey
  )
  const fetchedTxHashes = new Set(
    walletList?.pages.flatMap(({ pageTransactions }) => pageTransactions.map(({ hash }) => hash)) ?? []
  )

  const latestTxOfEachAddress = addressHashes
    .map((addressHash) =>
      queryClient.getQueryData<AddressLatestTransactionQueryFnData>(
        addressLatestTransactionQuery({ addressHash, networkId, isExplorerOnline: true }).queryKey
      )
    )
    .filter((data): data is AddressLatestTransactionQueryFnData => data !== undefined)

  return refreshWalletTransactions(findAddressesWithNewTxs(latestTxOfEachAddress, fetchedTxHashes))
}

export const useFetchWalletTransactionsInfinite = () => {
  const networkId = useNetworkId()
  const isExplorerOnline = useIsExplorerOnline()
  const addressHashes = useUnsortedAddressesHashes()

  const { data: latestTxOfEachAddress, isLoading: isLoadingLatestTx } = useFetchLatestTransactionOfEachAddress()

  const query = walletTransactionsInfiniteQuery({ addressHashes, networkId, isExplorerOnline, skip: isLoadingLatestTx })

  const { data, fetchNextPage, isLoading, isFetching, hasNextPage, isFetchingNextPage } = useInfiniteQuery(query)

  const fetchedConfirmedTxs = useMemo(
    () => data?.pages.flatMap(({ pageTransactions }) => pageTransactions) ?? [],
    [data?.pages]
  )

  const addressesWithNewTxs = useMemo(
    () => findAddressesWithNewTxs(latestTxOfEachAddress, new Set(fetchedConfirmedTxs.map(({ hash }) => hash))),
    [fetchedConfirmedTxs, latestTxOfEachAddress]
  )

  // Refetching the list on its own would rebuild it from the pages it is already holding
  const refresh = useCallback(() => refreshWalletTransactions(addressesWithNewTxs), [addressesWithNewTxs])

  const pagesLoaded = data?.pageParams.length

  return {
    data: fetchedConfirmedTxs,
    fetchNextPage,
    isLoading: isLoadingLatestTx || isLoading,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    pagesLoaded,
    refresh,
    // An errored or not yet started list has an empty fetched set, which would otherwise make every address in the
    // wallet look like it had new transactions to offer.
    showNewTxsMessage: data !== undefined && addressesWithNewTxs.length > 0
  }
}
