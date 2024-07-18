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

import { useQueries } from '@tanstack/react-query'

import { addressBalanceQuery } from '@/api/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectAddressesLatestHash } from '@/storage/transactions/transactionsSelectors'

const useTotalAlphBalances = () => {
  const latestAddressesTxHashes = useAppSelector(selectAddressesLatestHash)
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const { data, isLoading } = useQueries({
    queries: latestAddressesTxHashes.map(({ addressHash, latestTxHash }) =>
      addressBalanceQuery({ addressHash, latestTxHash, networkId })
    ),
    combine: (results) => ({
      data: results.reduce(
        (totalBalances, { data }) => {
          totalBalances.totalBalance += data ? BigInt(data.balance) : BigInt(0)
          totalBalances.totalLockedBalance += data ? BigInt(data.lockedBalance) : BigInt(0)

          return totalBalances
        },
        {
          totalBalance: BigInt(0),
          totalLockedBalance: BigInt(0)
        }
      ),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    ...data,
    isLoading
  }
}

export default useTotalAlphBalances
