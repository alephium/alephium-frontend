import { AddressHash } from '@alephium/shared'
import { queryClient, useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import useFetchAddressLatestTransaction from '@/api/apiDataHooks/address/useFetchAddressLatestTransaction'
import { addressTransactionsInfiniteQuery } from '@/api/queries/transactionQueries'

interface UseFetchAddressInfiniteTransactionsProps {
  addressHash: AddressHash
}

const useFetchAddressInfiniteTransactions = ({ addressHash }: UseFetchAddressInfiniteTransactionsProps) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data: addressLatestTx, isLoading: isLoadingLatestTx } = useFetchAddressLatestTransaction({ addressHash })

  const query = addressTransactionsInfiniteQuery({ addressHash, networkId, skip: isLoadingLatestTx })

  const { data, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage } = useInfiniteQuery(query)

  const refresh = useCallback(() => queryClient.refetchQueries({ queryKey: query.queryKey }), [query.queryKey])

  const fetchedConfirmedTxs = useMemo(() => data?.pages.flat() ?? [], [data?.pages])
  const latestFetchedTxHash = fetchedConfirmedTxs[0]?.hash
  const latestUnfetchedTxHash = addressLatestTx?.latestTx?.hash
  const showNewTxsMessage = !isLoading && latestUnfetchedTxHash && latestFetchedTxHash !== latestUnfetchedTxHash

  return {
    data: fetchedConfirmedTxs,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    refresh,
    showNewTxsMessage
  }
}

export default useFetchAddressInfiniteTransactions
