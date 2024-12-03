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
import { explorer as e, sleep } from '@alephium/web3'
import { infiniteQueryOptions, queryOptions, skipToken } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { getQueryConfig } from '@/api/apiDataHooks/utils/getQueryConfig'
import queryClient from '@/api/queryClient'

export interface AddressLatestTransactionQueryProps {
  addressHash: AddressHash
  networkId?: number
  skip?: boolean
}

export interface AddressLatestTransactionQueryFnData {
  addressHash: AddressHash
  latestTx?: e.Transaction
}

export const addressLatestTransactionQuery = ({ addressHash, networkId, skip }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'transaction', 'latest', { networkId }],
    ...getQueryConfig({ gcTime: FIVE_MINUTES_MS, networkId }),
    queryFn:
      !skip && networkId !== undefined
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
  networkId?: number
  skip?: boolean
}

interface AddressTransactionsInfiniteQueryProps extends TransactionsInfiniteQueryBaseProps {
  addressHash: AddressHash
}

export const addressTransactionsInfiniteQuery = ({
  addressHash,
  networkId,
  skip
}: AddressTransactionsInfiniteQueryProps) =>
  infiniteQueryOptions({
    queryKey: ['address', addressHash, 'transactions', { networkId }],
    // 5 minutes after the user navigates away from the address details modal, the cached data will be deleted.
    ...getQueryConfig({ staleTime: Infinity, gcTime: FIVE_MINUTES_MS, networkId }),
    queryFn:
      !skip && networkId !== undefined
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
  networkId,
  skip
}: WalletTransactionsInfiniteQueryProps) =>
  infiniteQueryOptions({
    queryKey: ['wallet', 'transactions', { networkId, addressHashes }],
    // When the user navigates away from the Transfers page for 5 minutes or when addresses are generated/removed the
    // cached data will be deleted.
    ...getQueryConfig({ staleTime: Infinity, gcTime: FIVE_MINUTES_MS, networkId }),
    queryFn:
      !skip && networkId !== undefined
        ? async ({ pageParam }) => {
            let results: e.Transaction[] = []
            const args = { page: pageParam }

            if (addressHashes.length === 1) {
              results = await throttledClient.explorer.addresses.getAddressesAddressTransactions(addressHashes[0], args)
            } else if (addressHashes.length > 1) {
              results = await throttledClient.explorer.addresses.postAddressesTransactions(args, addressHashes)
            }

            return results
          }
        : skipToken,
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => (lastPage.length > 0 ? (lastPageParam += 1) : null)
  })

interface WalletLatestTransactionsQueryProps {
  networkId?: number
  addressHashes: AddressHash[]
}

export const walletLatestTransactionsQuery = ({ addressHashes, networkId }: WalletLatestTransactionsQueryProps) =>
  queryOptions({
    queryKey: ['wallet', 'transactions', 'latest', { networkId, addressHashes }],
    // When the user navigates away from the Overview page for 5 minutes or when addresses are generated/removed the
    // cached data will be deleted.
    ...getQueryConfig({ staleTime: Infinity, gcTime: FIVE_MINUTES_MS, networkId }),
    queryFn:
      networkId !== undefined
        ? async () => {
            let results: e.Transaction[] = []
            const args = { page: 1, limit: 5 }

            if (addressHashes.length === 1) {
              results = await throttledClient.explorer.addresses.getAddressesAddressTransactions(addressHashes[0], args)
            } else if (addressHashes.length > 1) {
              results = await throttledClient.explorer.addresses.postAddressesTransactions(args, addressHashes)
            }

            return results
          }
        : skipToken
  })

interface TransactionQueryProps extends SkipProp {
  txHash: string
  networkId?: number
}

export const confirmedTransactionQuery = ({ txHash, networkId, skip }: TransactionQueryProps) =>
  queryOptions({
    queryKey: ['transaction', 'confirmed', txHash],
    // When the user navigates away from the transaction details modal for 5 minutes or when a sent tx confirms the
    // cached data will be deleted.
    ...getQueryConfig({ staleTime: Infinity, gcTime: FIVE_MINUTES_MS, networkId }),
    queryFn: !skip ? () => throttledClient.explorer.transactions.getTransactionsTransactionHash(txHash) : skipToken
  })

export const pendingTransactionQuery = ({ txHash, networkId, skip }: TransactionQueryProps) =>
  queryOptions({
    queryKey: ['transaction', 'pending', txHash],
    // 5 minutes after a sent tx is confirmed, the cached data will be deleted. We cannot set it to a lower value than
    // the default one because the highest gcTime is always in effect. We would need to set the default to a lower one
    // just for this one, but is it worth it?
    ...getQueryConfig({ gcTime: FIVE_MINUTES_MS, networkId }),
    refetchInterval: 3000,
    queryFn: !skip
      ? async () => {
          // Delay initial query to give the tx some time to enter the mempool instead of getting 404's
          if (!queryClient.getQueryData(['transaction', 'pending', txHash])) await sleep(3000)

          return throttledClient.explorer.transactions.getTransactionsTransactionHash(txHash)
        }
      : skipToken
  })
