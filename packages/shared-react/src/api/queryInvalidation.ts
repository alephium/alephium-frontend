import { AddressHash, isTokenResolutionFallback } from '@alephium/shared/types'
import { InfiniteData } from '@tanstack/react-query'

import { ADDRESS_DATA } from '../api/queries/addressQueries'
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

export const invalidateTokenPrices = async () => {
  await queryClient.invalidateQueries({ queryKey: ['tokenPrices', 'currentPrice'] })
}

export const invalidateTokenResolutionFallbacks = async () => {
  await queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === 'token' && isTokenResolutionFallback(query.state.data)
  })
}

const WALLET_TRANSACTIONS_QUERY_KEY = ['wallet', 'transactions']

// A new transaction does not only add a row, it pushes every later transaction one place down, so
// every loaded page below the first is now wrong. The wallet list drops those pages instead of
// refetching them, because rebuilding page N of that list costs one request per address.
// See: https://github.com/alephium/alephium-frontend/issues/1475
//
// The updater form is deliberate. `setQueriesData` with a fixed value would write the first matching
// query's pages onto every other query the prefix matches, which for this key means across networks
// and across address sets.
const dropPagesAfterFirstThenInvalidateWalletTransactions = async () => {
  queryClient.setQueriesData<InfiniteData<unknown, unknown>>({ queryKey: WALLET_TRANSACTIONS_QUERY_KEY }, (data) =>
    data && data.pages.length > 1 ? { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) } : data
  )

  await queryClient.invalidateQueries({ queryKey: WALLET_TRANSACTIONS_QUERY_KEY })
}

// Both transaction lists read their rows through this address's page queries, so anything that wants
// fresher transactions has to expire those pages first, or a list rebuilds itself out of the same
// cache and the refresh does nothing. Cancelling before invalidating is what the address data pass
// above does and for the same reason: a page fetch already in flight would otherwise resolve with
// pre-transaction data and clear the invalidation flag, which staleTime Infinity makes permanent.
// Cancelling strands whichever list was awaiting that page, so the caller below re-drives the list.
const cancelThenInvalidateAddressTransactionsPages = async (addressHash: AddressHash) => {
  const queryKey = ['address', addressHash, 'transactions', 'page']

  await queryClient.cancelQueries({ queryKey })
  await queryClient.invalidateQueries({ queryKey })
}

export const invalidateAddressTransactions = async (addressHash: AddressHash) => {
  await cancelThenInvalidateAddressTransactionsPages(addressHash)
  await dropPagesAfterFirstThenInvalidateWalletTransactions()
}
