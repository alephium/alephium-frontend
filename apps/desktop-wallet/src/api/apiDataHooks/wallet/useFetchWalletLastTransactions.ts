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

import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useQueries, UseQueryResult } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { addressLatestTransactionQuery, AddressLatestTransactionQueryFnData } from '@/api/queries/transactionQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'
import { isDefined } from '@/utils/misc'

export const useFetchWalletLastTransaction = (props?: SkipProp) =>
  useFetchWalletLastTransactions({ combine: extractMostRecentTransaction, skip: props?.skip })

export const useFetchWalletLastTransactionHashes = (props?: SkipProp) =>
  useFetchWalletLastTransactions({ combine: extractLastTransactionHashes, skip: props?.skip })

interface UseFetchWalletLastTransactionsProps<T> extends SkipProp {
  combine: (results: UseQueryResult<AddressLatestTransactionQueryFnData>[]) => { data: T; isLoading: boolean }
}
const useFetchWalletLastTransactions = <T>({ combine, skip }: UseFetchWalletLastTransactionsProps<T>) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const allAddressHashes = useAppSelector(selectAllAddressHashes)

  const { data, isLoading } = useQueries({
    queries: !skip
      ? allAddressHashes.map((addressHash) => addressLatestTransactionQuery({ addressHash, networkId }))
      : [],
    combine
  })

  return {
    data,
    isLoading
  }
}

const extractMostRecentTransaction = (results: UseQueryResult<AddressLatestTransactionQueryFnData>[]) => ({
  data: results.reduce(
    (acc, { data }) => {
      acc.latestTx = (data?.latestTx?.timestamp ?? 0) > (acc.latestTx?.timestamp ?? 0) ? data?.latestTx : acc.latestTx
      acc.previousTx =
        (data?.previousTx?.timestamp ?? 0) > (acc.previousTx?.timestamp ?? 0) ? data?.previousTx : acc.previousTx

      return acc
    },
    {
      latestTx: undefined as Transaction | undefined,
      previousTx: undefined as Transaction | undefined
    }
  ),
  ...combineIsLoading(results)
})

const extractLastTransactionHashes = (results: UseQueryResult<AddressLatestTransactionQueryFnData>[]) => ({
  data: results
    .flatMap(({ data }) =>
      data
        ? { addressHash: data.addressHash, latestTxHash: data?.latestTx?.hash, previousTxHash: data?.previousTx?.hash }
        : undefined
    )
    .filter(isDefined),
  ...combineIsLoading(results)
})
