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
import { useQuery } from '@tanstack/react-query'

import { addressTokensBalancesQuery } from '@/api/queries/addressQueries'
import { addressLatestTransactionHashQuery } from '@/api/queries/transactionQueries'
import { useAppSelector } from '@/hooks/redux'

const useAddressTokensBalances = (addressHash: AddressHash) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const queryProps = { addressHash, networkId }

  const { data: txHashes, isLoading: isLoadingTxHashes } = useQuery(addressLatestTransactionHashQuery(queryProps))

  const { data, isLoading: isLoadingTokensBalances } = useQuery(
    addressTokensBalancesQuery({
      ...queryProps,
      latestTxHash: txHashes?.latestTxHash,
      previousTxHash: txHashes?.latestTxHash,
      skip: isLoadingTxHashes
    })
  )

  return {
    data,
    isLoading: isLoadingTokensBalances || isLoadingTxHashes
  }
}

export default useAddressTokensBalances
