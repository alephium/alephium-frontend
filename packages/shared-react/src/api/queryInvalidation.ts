import { AddressHash, isTokenResolutionFallback } from '@alephium/shared/types'
import { InfiniteData } from '@tanstack/react-query'

import {
  AddressTransactionsInfiniteQueryPageData,
  WalletTransactionsInfiniteQueryPageParam
} from '../api/queries/transactionQueries'
import { queryClient } from '../api/queryClient'

export const ADDRESS_QUERY_LEVELS = ['level:-1', 'level:0', 'level:1', 'level:2', 'level:3', 'level:4'] as const

// Queries need to be invalidated in order of dependency
export const invalidateAddressQueries = async (addressHash: AddressHash) => {
  for (const level of ADDRESS_QUERY_LEVELS) {
    await queryClient.invalidateQueries({ queryKey: ['address', addressHash, level] })
  }
}

export const invalidateWalletQueries = async () => {
  await invalidateWalletTransactionsQuery()
}

export const invalidateTokenPrices = async () => {
  await queryClient.invalidateQueries({ queryKey: ['tokenPrices', 'currentPrice'] })
}

export const invalidateTokenResolutionFallbacks = async () => {
  await queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === 'token' && isTokenResolutionFallback(query.state.data)
  })
}

type WalletTransactionsQueryData = InfiniteData<
  AddressTransactionsInfiniteQueryPageData,
  WalletTransactionsInfiniteQueryPageParam
>

const invalidateWalletTransactionsQuery = async () => {
  const queryKey = ['wallet', 'transactions']

  // We use `getQueriesData` instead of `getQueryData` because we cannot reconstruct the full query key
  const data = queryClient.getQueriesData({ queryKey })

  // Keep only the first page of the wallet transactions query to avoid refetching all loaded pages
  // See: https://github.com/alephium/alephium-frontend/issues/1475
  if (data && data[0] && data[0][1]) {
    const firstPageData = data[0][1] as WalletTransactionsQueryData

    if (
      firstPageData?.pages &&
      firstPageData.pages.length > 0 &&
      firstPageData?.pageParams &&
      firstPageData.pageParams.length > 0
    ) {
      queryClient.setQueriesData({ queryKey }, () => ({
        pages: firstPageData.pages.slice(0, 1),
        pageParams: firstPageData.pageParams.slice(0, 1)
      }))
    }
  }

  await queryClient.invalidateQueries({ queryKey })
}
