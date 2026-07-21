import { AddressHash, isTokenResolutionFallback } from '@alephium/shared/types'
import { InfiniteData } from '@tanstack/react-query'

import { ADDRESS_DATA } from '../api/queries/addressQueries'
import {
  AddressTransactionsInfiniteQueryPageData,
  WalletTransactionsInfiniteQueryPageParam
} from '../api/queries/transactionQueries'
import { queryClient } from '../api/queryClient'

const isAddressDataQuery = (queryKey: readonly unknown[], matchesAddress: (hash: AddressHash) => boolean) =>
  queryKey[0] === 'address' &&
  typeof queryKey[1] === 'string' &&
  matchesAddress(queryKey[1] as AddressHash) &&
  queryKey[2] === ADDRESS_DATA

// Address balance/token queries compose their dependencies through fetchQuery inside their queryFns. A plain
// invalidateQueries breaks that graph two ways: its default cancelRefetch:true cancels the dependency fetch a
// consumer is mid-await on (stranding the consumer on stale data), and a fetch already in flight when we invalidate
// resolves with pre-change data and clears the invalidation flag. cancelQueries drops any in-flight fetch first, then
// invalidateQueries with cancelRefetch:false lets each consumer dedupe onto its dependency's fetch instead of
// cancelling it. This converges regardless of cache insertion order, so no dependency-level ordering is needed.
const cancelThenInvalidateAddressQueries = async (matchesAddress: (hash: AddressHash) => boolean) => {
  const predicate = (query: { queryKey: readonly unknown[] }) => isAddressDataQuery(query.queryKey, matchesAddress)

  await queryClient.cancelQueries({ predicate })
  await queryClient.invalidateQueries({ predicate }, { cancelRefetch: false })
}

export const invalidateAddressQueries = (addressHash: AddressHash) =>
  cancelThenInvalidateAddressQueries((hash) => hash === addressHash)

export const invalidateAddressesQueries = (addressHashes: Set<AddressHash>) =>
  cancelThenInvalidateAddressQueries((hash) => addressHashes.has(hash))

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
