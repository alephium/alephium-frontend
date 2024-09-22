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

import { calculateAmountWorth } from '@alephium/shared'
import { useQueries } from '@tanstack/react-query'
import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineDefined } from '@/api/apiDataHooks/apiDataHooksUtils'
import useFetchTokenPrices from '@/api/apiDataHooks/useFetchTokenPrices'
import { fungibleTokenMetadataQuery } from '@/api/queries/tokenQueries'
import { DisplayBalances, ListedFT, TokenId } from '@/types/tokens'

interface UseSortFTsProps extends SkipProp {
  listedFts: (ListedFT & DisplayBalances)[]
  unlistedFtIds: TokenId[]
}

const useFetchSortedFts = ({ listedFts, unlistedFtIds, skip }: UseSortFTsProps) => {
  const { data: unlistedFts, isLoading: isLoadingUnlistedFTs } = useQueries({
    queries: unlistedFtIds.map((id) => fungibleTokenMetadataQuery({ id })),
    combine: combineDefined
  })

  const { data: tokenPrices } = useFetchTokenPrices({ skip })

  return {
    sortedUnlistedFts: useMemo(
      () => (!skip ? orderBy(unlistedFts, ['name', 'id'], ['asc', 'asc']) : unlistedFts),
      [skip, unlistedFts]
    ),
    sortedListedFts: useMemo(
      () =>
        !skip
          ? orderBy(
              listedFts,
              [
                (token) => {
                  const tokenPrice = tokenPrices?.find((tokenPrice) => tokenPrice.symbol === token.symbol)?.price

                  return tokenPrice !== undefined
                    ? calculateAmountWorth(token.totalBalance, tokenPrice, token.decimals)
                    : -1
                },
                'name',
                'id'
              ],
              ['desc', 'asc', 'asc']
            )
          : listedFts,
      [listedFts, skip, tokenPrices]
    ),
    isLoading: isLoadingUnlistedFTs
  }
}

export default useFetchSortedFts
