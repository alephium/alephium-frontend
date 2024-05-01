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

import { addressesQueries } from '@/api'
import { uniq } from '@/utils'
import { AddressesConfirmedTransaction } from '@/types'

export const useAddressesConfirmedTransactions = (addressHashes: string[]) => {
  const { data: confirmedTxsPages, fetchNextPage } = useInfiniteQuery(
    addressesQueries.transactions.getAddressesTransactions(addressHashes)
  )

  const txs: AddressesConfirmedTransaction[] | undefined = confirmedTxsPages?.pages
    .flatMap((txs) => txs)
    .map((tx) => ({
      ...tx,
      internalAddressHashes: {
        inputAddresses: tx.inputs
          ? uniq(
              tx.inputs.flatMap((input) =>
                input.address && addressHashes.includes(input.address) ? input.address : []
              )
            )
          : undefined,
        outputAddresses: tx.outputs
          ? uniq(
              tx.outputs?.flatMap((output) =>
                output.address && addressHashes.includes(output.address) ? output.address : []
              )
            )
          : undefined
      }
    }))

  return {
    fetchNextPage,
    txs
  }
}
