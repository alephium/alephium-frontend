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
import { isNumber } from 'lodash'
import { useMemo } from 'react'

import useFetchTokenPrices from '@/api/apiDataHooks/market/useFetchTokenPrices'
import { ApiBalances, ListedFT } from '@/types/tokens'

interface UseListedFtsWorthProps {
  listedFts: (ListedFT & ApiBalances)[]
}

const useFetchListedFtsWorth = ({ listedFts }: UseListedFtsWorthProps) => {
  const { data: tokenPrices, isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  const worth = useMemo(
    () =>
      listedFts.reduce((totalWorth, token) => {
        const tokenPrice = tokenPrices?.find(({ symbol }) => symbol === token.symbol)?.price
        const tokenWorth = isNumber(tokenPrice)
          ? calculateAmountWorth(BigInt(token.totalBalance), tokenPrice, token.decimals)
          : 0

        return totalWorth + tokenWorth
      }, 0),
    [tokenPrices, listedFts]
  )

  return {
    data: worth,
    isLoading: isLoadingTokenPrices
  }
}

export default useFetchListedFtsWorth
