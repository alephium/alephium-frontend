import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import useFetchWalletLatestTransaction from '@/api/apiDataHooks/wallet/useFetchWalletLatestTransaction'
import { walletTransactionsInfiniteQuery } from '@/api/queries/transactionQueries'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'

const useFetchWalletTransactionsInfinite = () => {
  const networkId = useCurrentlyOnlineNetworkId()
  const addressHashes = useUnsortedAddressesHashes()

  const { isLoading: isLoadingLatestTx } = useFetchWalletLatestTransaction()

  const query = walletTransactionsInfiniteQuery({ addressHashes, networkId, skip: isLoadingLatestTx })

  const { data, fetchNextPage, isLoading, isFetching, hasNextPage, isFetchingNextPage } = useInfiniteQuery(query)

  const fetchedConfirmedTxs = useMemo(
    () => data?.pages.flatMap(({ pageTransactions }) => pageTransactions) ?? [],
    [data?.pages]
  )

  const pagesLoaded = data?.pageParams.length

  return {
    data: fetchedConfirmedTxs,
    fetchNextPage,
    isLoading,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    pagesLoaded
  }
}

export default useFetchWalletTransactionsInfinite
