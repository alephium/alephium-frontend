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

import { AddressHash, FIVE_MINUTES_MS, throttledClient } from '@alephium/shared'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { infiniteQueryOptions, queryOptions, skipToken } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import queryClient from '@/api/queryClient'

export interface AddressLatestTransactionQueryProps {
  addressHash: AddressHash
  networkId: number
  skip?: boolean
}

export interface AddressLatestTransactionQueryFnData {
  addressHash: AddressHash
  latestTx?: Transaction
}

export const addressLatestTransactionQuery = ({ addressHash, networkId, skip }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'transaction', 'latest', { networkId }],
    gcTime: Infinity,
    queryFn: !skip
      ? async ({ queryKey }) => {
          const transactions = await throttledClient.explorer.addresses.getAddressesAddressTransactions(addressHash, {
            page: 1,
            limit: 1
          })

          const latestTx = transactions.length > 0 ? transactions[0] : undefined
          const cachedData = queryClient.getQueryData(queryKey) as AddressLatestTransactionQueryFnData | undefined
          const cachedLatestTx = cachedData?.latestTx

          // The following block invalidates queries that need to refetch data if a new transaction hash has been
          // detected. This way, we don't need to use the latest tx hash in the queryKey of each of those queries.
          if (latestTx !== undefined && latestTx.hash !== cachedLatestTx?.hash) {
            queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'balance'] })
            queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions', 'latest'] })
          }

          return {
            addressHash, // Needed in combine functions to identify which address the latestTx refers to
            latestTx
          }
        }
      : skipToken
  })

interface TransactionsInfiniteQueryBaseProps {
  networkId: number
  timestamp: number
  skip?: boolean
}

interface AddressTransactionsInfiniteQueryProps extends TransactionsInfiniteQueryBaseProps {
  addressHash: AddressHash
}

export const addressTransactionsInfiniteQuery = ({
  addressHash,
  timestamp,
  networkId,
  skip
}: AddressTransactionsInfiniteQueryProps) =>
  infiniteQueryOptions({
    queryKey: ['address', addressHash, 'transactions', { timestamp, networkId }],
    staleTime: Infinity,
    gcTime: FIVE_MINUTES_MS,
    queryFn: !skip
      ? ({ pageParam }) =>
          throttledClient.explorer.addresses.getAddressesAddressTransactions(addressHash, { page: pageParam })
      : skipToken,
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => (lastPage.length > 0 ? (lastPageParam += 1) : null)
  })

interface WalletTransactionsInfiniteQueryProps extends TransactionsInfiniteQueryBaseProps {
  addressHashes: AddressHash[]
}

export const walletTransactionsInfiniteQuery = ({
  addressHashes,
  timestamp,
  networkId,
  skip
}: WalletTransactionsInfiniteQueryProps) =>
  infiniteQueryOptions({
    queryKey: ['wallet', 'transactions', { timestamp, networkId, addressHashes }],
    staleTime: Infinity,
    gcTime: FIVE_MINUTES_MS,
    queryFn: !skip
      ? ({ pageParam }) =>
          throttledClient.explorer.addresses.postAddressesTransactions({ page: pageParam }, addressHashes)
      : skipToken,
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => (lastPage.length > 0 ? (lastPageParam += 1) : null)
  })

interface WalletLatestTransactionsQueryProps {
  networkId: number
  addressHashes: AddressHash[]
}

export const walletLatestTransactionsQuery = ({ addressHashes, networkId }: WalletLatestTransactionsQueryProps) =>
  queryOptions({
    queryKey: ['wallet', 'transactions', 'latest', { networkId, addressHashes }],
    staleTime: Infinity,
    gcTime: FIVE_MINUTES_MS,
    queryFn: () => throttledClient.explorer.addresses.postAddressesTransactions({ page: 1, limit: 5 }, addressHashes)
  })

interface TransactionQueryProps extends SkipProp {
  txHash: string
}

export const confirmedTransactionQuery = ({ txHash, skip }: TransactionQueryProps) =>
  queryOptions({
    queryKey: ['transaction', 'confirmed', txHash],
    staleTime: Infinity,
    gcTime: FIVE_MINUTES_MS,
    queryFn: !skip ? () => throttledClient.explorer.transactions.getTransactionsTransactionHash(txHash) : skipToken
  })

export const pendingTransactionQuery = ({ txHash, skip }: TransactionQueryProps) =>
  queryOptions({
    queryKey: ['transaction', 'pending', txHash],
    gcTime: FIVE_MINUTES_MS,
    refetchInterval: 3000,
    queryFn: !skip ? () => throttledClient.explorer.transactions.getTransactionsTransactionHash(txHash) : skipToken
  })
