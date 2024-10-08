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

import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'

import useLimitedWalletAddresses from '@/api/apiDataHooks/utils/useLimitedWalletAddresses'
import { useFetchWalletLastTransaction } from '@/api/apiDataHooks/wallet/useFetchWalletLastTransactions'
import { walletTransactionsInfiniteQuery } from '@/api/queries/transactionQueries'
import { useAppSelector } from '@/hooks/redux'

const useFetchWalletTransactionsInfinite = () => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const { addressHashes, isLimited } = useLimitedWalletAddresses()

  const [fetchedTransactionListAt, setFetchedTransactionListAt] = useState(0)
  const refresh = useCallback(() => setFetchedTransactionListAt(new Date().getTime()), [])

  const { data: latestTx, isLoading: isLoadingLatestTx } = useFetchWalletLastTransaction()
  const { data, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    walletTransactionsInfiniteQuery({
      addressHashes,
      timestamp: fetchedTransactionListAt,
      networkId,
      skip: isLoadingLatestTx
    })
  )

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
    isDataComplete: !isLimited
  }
}

export default useFetchWalletTransactionsInfinite
