import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import useFetchWalletLatestTransaction from '@/api/apiDataHooks/wallet/useFetchWalletLatestTransaction'
import { walletTransactionsInfiniteQuery } from '@/api/queries/transactionQueries'
import queryClient from '@/api/queryClient'
import { useAppSelector } from '@/hooks/redux'
import { useCappedAddressesHashes } from '@/hooks/useAddresses'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

const useFetchWalletTransactionsInfinite = () => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const { addressHashes, isCapped } = useCappedAddressesHashes()

  const { data: latestTx, isLoading: isLoadingLatestTx } = useFetchWalletLatestTransaction()

  const query = walletTransactionsInfiniteQuery({ addressHashes, networkId, skip: isLoadingLatestTx })

  const { data, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage } = useInfiniteQuery(query)

  const refresh = useCallback(() => queryClient.refetchQueries({ queryKey: query.queryKey }), [query.queryKey])

  const fetchedConfirmedTxs = useMemo(() => data?.pages.flat() ?? [], [data?.pages])
  const latestFetchedTxHash = fetchedConfirmedTxs[0]?.hash
  const latestUnfetchedTxHash = latestTx?.hash
  const showNewTxsMessage = !isLoading && latestUnfetchedTxHash && latestFetchedTxHash !== latestUnfetchedTxHash

  return {
    data: fetchedConfirmedTxs,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    refresh,
    showNewTxsMessage,
    isDataComplete: !isCapped
  }
}

export default useFetchWalletTransactionsInfinite
