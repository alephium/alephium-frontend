import {
  AddressHash,
  FIVE_MINUTES_MS,
  ONE_MINUTE_MS,
  throttledClient,
  TRANSACTIONS_PAGE_DEFAULT_LIMIT
} from '@alephium/shared'
import { getQueryConfig } from '@alephium/shared-react'
import { explorer as e, sleep } from '@alephium/web3'
import { infiniteQueryOptions, queryOptions, skipToken } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import queryClient from '@/api/queryClient'

export interface AddressLatestTransactionQueryProps {
  addressHash: AddressHash
  networkId?: number
  skip?: boolean
}

export interface AddressLatestTransactionQueryFnData {
  addressHash: AddressHash
  latestTx?: Pick<e.Transaction, 'hash' | 'timestamp'>
}

export const addressLatestTransactionQuery = ({ addressHash, networkId, skip }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'transaction', 'latest', { networkId }],
    ...getQueryConfig({ staleTime: ONE_MINUTE_MS, gcTime: FIVE_MINUTES_MS, networkId }),
    queryFn:
      !skip && networkId !== undefined
        ? async ({ queryKey }) => {
            let latestTx = undefined

            // Backend returns 404 if the address has no transactions and Tanstack will consider it an error. This will
            // result in isLoading to be set to true more often than needed, leading to unnecessary re-renders. By
            // catching the error and setting latestTx to undefined, we can avoid this issue.
            try {
              latestTx = await throttledClient.explorer.addresses.getAddressesAddressLatestTransaction(addressHash)
            } catch (error) {
              if (!(error instanceof Error && error.message.includes('Status code: 404'))) {
                throw error
              }
            }

            const cachedData = queryClient.getQueryData(queryKey) as AddressLatestTransactionQueryFnData | undefined
            const cachedLatestTx = cachedData?.latestTx

            // The following block invalidates queries that need to refetch data if a new transaction hash has been
            // detected. This way, we don't need to use the latest tx hash in the queryKey of each of those queries.
            if (latestTx !== undefined && latestTx.hash !== cachedLatestTx?.hash) {
              // The backend needs some time to update the results of the following queries
              // See https://github.com/alephium/alephium-frontend/issues/981#issuecomment-2535493157
              await sleep(2000)
              queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'balance'] })
              queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'transactions', 'latest'] })
              queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'computedData'] })
              queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] })
            }

            return {
              addressHash, // Needed in combine functions to identify which address the latestTx refers to
              latestTx: latestTx ? { hash: latestTx.hash, timestamp: latestTx.timestamp } : undefined
            }
          }
        : skipToken
  })

export const addressLatestTransactionsQuery = ({ addressHash, networkId }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'transactions', 'latest', { networkId }],
    // When the user navigates away from the Overview page for 5 minutes or when addresses are generated/removed
    // the cached data will be deleted.
    ...getQueryConfig({ staleTime: Infinity, gcTime: FIVE_MINUTES_MS, networkId }),
    queryFn: () =>
      throttledClient.explorer.addresses.getAddressesAddressTransactions(addressHash, { page: 1, limit: 5 })
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
    queryKey: ['address', addressHash, 'transactions', 'infinite', { networkId }],
    // 5 minutes after the user navigates away from the address details modal, the cached data will be deleted.
    ...getQueryConfig({ staleTime: Infinity, gcTime: FIVE_MINUTES_MS, networkId }),
    queryFn:
      !skip && networkId !== undefined
        ? ({ pageParam }) =>
            throttledClient.explorer.addresses.getAddressesAddressTransactions(addressHash, {
              page: pageParam,
              limit: TRANSACTIONS_PAGE_DEFAULT_LIMIT
            })
        : skipToken,
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => (lastPage.length > 0 ? (lastPageParam += 1) : null)
  })

interface WalletTransactionsInfiniteQueryProps extends TransactionsInfiniteQueryBaseProps {
  addressHashes: AddressHash[]
}

type PageParam = {
  page: number
  addressesWithMoreTxPages: AddressHash[]
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
            const addresses = pageParam.page === 1 ? addressHashes : pageParam.addressesWithMoreTxPages
            const pageResults = await Promise.all(
              addresses.map(async (addressHash) => ({
                addressHash,
                transactions: await throttledClient.explorer.addresses.getAddressesAddressTransactions(addressHash, {
                  page: pageParam.page,
                  limit: TRANSACTIONS_PAGE_DEFAULT_LIMIT
                })
              }))
            )

            const addressesWithMoreTxPages = addresses.filter((hash) => {
              const txs = pageResults.find(({ addressHash }) => addressHash === hash)?.transactions

              return txs && txs.length > 0
            })

            return {
              pageTransactions: pageResults.flatMap(({ transactions }) => transactions),
              addressesWithMoreTxPages
            }
          }
        : skipToken,
    initialPageParam: {
      page: 1,
      addressesWithMoreTxPages: []
    } as PageParam,
    getNextPageParam: ({ addressesWithMoreTxPages }, _, lastPageParam) =>
      lastPageParam.page !== 1 && lastPageParam.addressesWithMoreTxPages.length === 0
        ? null
        : ({
            page: lastPageParam.page + 1,
            addressesWithMoreTxPages
          } as PageParam)
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
