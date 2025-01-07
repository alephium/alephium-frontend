import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import useFetchWalletLatestTransaction from '@/api/apiDataHooks/wallet/useFetchWalletLatestTransaction'
import { walletTransactionsInfiniteQuery } from '@/api/queries/transactionQueries'
import queryClient from '@/api/queryClient'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

const useFetchWalletTransactionsInfinite = () => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const addressHashes = useUnsortedAddressesHashes()

  const { data: latestTx, isLoading: isLoadingLatestTx } = useFetchWalletLatestTransaction()

  const query = walletTransactionsInfiniteQuery({ addressHashes, networkId, skip: isLoadingLatestTx })

  const { data, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage } = useInfiniteQuery(query)

  const refresh = useCallback(() => queryClient.refetchQueries({ queryKey: query.queryKey }), [query.queryKey])

  const fetchedConfirmedTxs = useMemo(
    () => data?.pages.flatMap(({ pageTransactions }) => pageTransactions) ?? [],
    [data?.pages]
  )
  const latestFetchedTxHash = fetchedConfirmedTxs[0]?.hash
  const latestUnfetchedTxHash = latestTx?.hash
  const showNewTxsMessage = !isLoading && latestUnfetchedTxHash && latestFetchedTxHash !== latestUnfetchedTxHash
  const pagesLoaded = data?.pageParams.length

  return {
    data: fetchedConfirmedTxs,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    refresh,
    showNewTxsMessage,
    pagesLoaded
  }
}

export default useFetchWalletTransactionsInfinite
