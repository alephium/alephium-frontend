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

import { AddressHash } from '@alephium/shared'
import { useQueries, UseQueryResult } from '@tanstack/react-query'

import useAddressesLastTransactionHashes from '@/api/apiDataHooks/useAddressesLastTransactionHashes'
import { combineIsLoading } from '@/api/apiDataHooks/utils'
import { addressAlphBalancesQuery, AddressAlphBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { DisplayBalances } from '@/types/tokens'

interface AddressesAlphBalancesTotal {
  data: DisplayBalances
  isLoading: boolean
}

const useAddressesAlphBalancesTotal = (addressHash?: AddressHash): AddressesAlphBalancesTotal => {
  const { data: latestTxHashes, isLoading: isLoadingLatestTxHashes } = useAddressesLastTransactionHashes(addressHash)
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const { data, isLoading } = useQueries({
    queries: latestTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressAlphBalancesQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine
  })

  return {
    data,
    isLoading: isLoading || isLoadingLatestTxHashes
  }
}

export default useAddressesAlphBalancesTotal

const combine = (results: UseQueryResult<AddressAlphBalancesQueryFnData>[]): AddressesAlphBalancesTotal => ({
  data: results.reduce(
    (totalBalances, { data }) => {
      totalBalances.totalBalance += data ? data.alphBalances.totalBalance : BigInt(0)
      totalBalances.lockedBalance += data ? data.alphBalances.lockedBalance : BigInt(0)
      totalBalances.availableBalance += data ? data.alphBalances.availableBalance : BigInt(0)

      return totalBalances
    },
    {
      totalBalance: BigInt(0),
      lockedBalance: BigInt(0),
      availableBalance: BigInt(0)
    } as DisplayBalances
  ),
  ...combineIsLoading(results)
})
