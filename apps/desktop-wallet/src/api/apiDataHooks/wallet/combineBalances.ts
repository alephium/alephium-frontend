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

import { UseQueryResult } from '@tanstack/react-query'

import { DataHook } from '@/api/apiDataHooks/types'
import { combineIsLoading } from '@/api/apiDataHooks/utils'
import { AddressAlphBalancesQueryFnData } from '@/api/queries/addressQueries'
import { DisplayBalances } from '@/types/tokens'

const combineBalances = (results: UseQueryResult<AddressAlphBalancesQueryFnData>[]): DataHook<DisplayBalances> => ({
  data: results.reduce(
    (totalBalances, { data }) => {
      totalBalances.totalBalance += data ? data.balances.totalBalance : BigInt(0)
      totalBalances.lockedBalance += data ? data.balances.lockedBalance : BigInt(0)
      totalBalances.availableBalance += data ? data.balances.availableBalance : BigInt(0)

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

export default combineBalances