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
import { useInfiniteQuery, useQueries } from '@tanstack/react-query'
import _ from 'lodash'

import { addressesQueries, combineQueriesResult } from '@/api'
import { AddressConfirmedTransaction, AddressMempoolTransaction } from '@/types'
import { uniq } from '@/utils'

export const useAddressesConfirmedTransactions = (addressHashes: string[]) => {
  const {
    data: confirmedTxsPages,
    fetchNextPage,
    hasNextPage,
    isLoading
  } = useInfiniteQuery(addressesQueries.transactions.getAddressesTransactions(addressHashes))

  const txs: AddressConfirmedTransaction[] | undefined = _(confirmedTxsPages?.pages)
    .flatMap((txs) => txs)
    .uniqBy((tx) => tx.hash)
    .map((tx) => ({
      ...tx,
      internalAddressHashes: {
        inputAddresses: uniq(
          tx.inputs?.flatMap((input) =>
            input.address && addressHashes.includes(input.address) ? input.address : []
          ) || []
        ),
        outputAddresses: uniq(
          tx.outputs?.flatMap((output) =>
            output.address && addressHashes.includes(output.address) ? output.address : []
          ) || []
        )
      }
    }))
    .value()

  return {
    fetchNextPage,
    hasNextPage,
    isLoading,
    txs
  }
}

export const useAddressesPendingTransactions = (addressHashes: string[]): AddressMempoolTransaction[][] => {
  const { data: pendingTxs } = useQueries({
    queries: addressHashes.map((h) => addressesQueries.transactions.getAddressPendingTransactions(h)),
    combine: combineQueriesResult
  })

  return pendingTxs.map((addressTxs, i) => addressTxs.map((tx) => ({ ...tx, internalAddressHash: addressHashes[i] })))
}
