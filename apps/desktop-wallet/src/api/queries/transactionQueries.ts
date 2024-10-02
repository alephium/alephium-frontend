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

import { AddressHash, throttledClient, TRANSACTIONS_REFRESH_INTERVAL } from '@alephium/shared'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { infiniteQueryOptions, queryOptions, skipToken } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import queryClient from '@/api/queryClient'

const ADDRESS_TRANSACTIONS_QUERY_KEYS = ['address', 'transactions']

interface AddressLatestTransactionQueryProps {
  addressHash: AddressHash
  networkId: number
  skip?: boolean
  pause?: boolean
}

export interface AddressLatestTransactionHashesProps extends AddressLatestTransactionQueryProps {
  latestTxHash?: Transaction['hash']
  previousTxHash?: Transaction['hash']
}

export interface AddressLatestTransactionQueryFnData {
  addressHash: AddressHash
  latestTx?: Transaction
  previousTx?: Transaction
}

export const addressUpdatesSignalQuery = ({ addressHash, networkId, skip }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: [...ADDRESS_TRANSACTIONS_QUERY_KEYS, 'latest', { addressHash, networkId }],
    queryFn: !skip
      ? async ({ queryKey }) => {
          const transactions = await throttledClient.explorer.addresses.getAddressesAddressTransactions(addressHash, {
            page: 1,
            limit: 1
          })

          const latestTx = transactions.length > 0 ? transactions[0] : undefined
          const cachedData = queryClient.getQueryData(queryKey) as AddressLatestTransactionQueryFnData | undefined
          const cachedLatestTx = cachedData?.latestTx
          const cachedPreviousTx = cachedData?.previousTx

          return {
            addressHash,
            latestTx,
            previousTx: cachedLatestTx !== latestTx ? cachedLatestTx : cachedPreviousTx
          }
        }
      : skipToken,
    refetchInterval: TRANSACTIONS_REFRESH_INTERVAL
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
    queryFn: !skip
      ? ({ pageParam }) =>
          throttledClient.explorer.addresses.getAddressesAddressTransactions(addressHash, { page: pageParam })
      : skipToken,
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => (lastPage.length > 0 ? (lastPageParam += 1) : null),
    staleTime: Infinity
  })

interface WalletTransactionsInfiniteQueryProps extends TransactionsInfiniteQueryBaseProps {
  allAddressHashes: AddressHash[]
}

export const walletTransactionsInfiniteQuery = ({
  allAddressHashes,
  timestamp,
  networkId,
  skip
}: WalletTransactionsInfiniteQueryProps) =>
  infiniteQueryOptions({
    queryKey: ['wallet', 'transactions', { timestamp, networkId, allAddressHashes }],
    queryFn: !skip
      ? ({ pageParam }) =>
          throttledClient.explorer.addresses.postAddressesTransactions({ page: pageParam }, allAddressHashes)
      : skipToken,
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => (lastPage.length > 0 ? (lastPageParam += 1) : null),
    staleTime: Infinity
  })

interface WalletLatestTransactionsQueryProps {
  networkId: number
  allAddressHashes: AddressHash[]
  latestTxHash?: string
  previousTxHash?: string
}

export const walletLatestTransactionsQuery = ({
  allAddressHashes,
  latestTxHash,
  previousTxHash,
  networkId
}: WalletLatestTransactionsQueryProps) => {
  const getQueryOptions = (latestTxHash: WalletLatestTransactionsQueryProps['latestTxHash']) =>
    queryOptions({
      queryKey: ['wallet', 'transactions', 'latest', { latestTxHash, networkId, allAddressHashes }],
      queryFn: () =>
        throttledClient.explorer.addresses.postAddressesTransactions({ page: 1, limit: 5 }, allAddressHashes),
      staleTime: Infinity
    })

  const previousQueryKey = getQueryOptions(previousTxHash).queryKey
  const latestQueryOptions = getQueryOptions(latestTxHash)

  return queryOptions({
    ...latestQueryOptions,
    placeholderData: queryClient.getQueryData(previousQueryKey)
  })
}

interface TransactionQueryProps extends SkipProp {
  txHash: string
}

export const confirmedTransactionQuery = ({ txHash, skip }: TransactionQueryProps) =>
  queryOptions({
    queryKey: ['transaction', 'confirmed', txHash],
    queryFn: !skip ? () => throttledClient.explorer.transactions.getTransactionsTransactionHash(txHash) : skipToken,
    staleTime: Infinity
  })

export const pendingTransactionQuery = ({ txHash, skip }: TransactionQueryProps) =>
  queryOptions({
    queryKey: ['transaction', 'pending', txHash],
    queryFn: !skip ? () => throttledClient.explorer.transactions.getTransactionsTransactionHash(txHash) : skipToken,
    refetchInterval: 3000
  })
