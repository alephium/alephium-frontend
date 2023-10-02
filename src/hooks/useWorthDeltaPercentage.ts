/*
Copyright 2018 - 2022 The Alephium Authors
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

import { calculateAmountWorth } from '@alephium/sdk'

import { useAppSelector } from '~/hooks/redux'
import { selectTotalBalance } from '~/store/addressesSlice'
import { useGetPriceQuery } from '~/store/assets/priceApiSlice'
import { DataPoint } from '~/types/charts'
import { currencies } from '~/utils/currencies'

const useWorthDeltaPercentage = (worthInBeginningOfChart?: DataPoint['worth']) => {
  const currency = useAppSelector((s) => s.settings.currency)
  const totalBalance = useAppSelector(selectTotalBalance)
  const { data: price } = useGetPriceQuery(currencies[currency].ticker, {
    pollingInterval: 60000,
    skip: totalBalance === BigInt(0)
  })

  const totalAmountWorth = calculateAmountWorth(totalBalance, price ?? 0)
  const initialValue =
    worthInBeginningOfChart === undefined ? 0 : worthInBeginningOfChart < 1 ? 1 : worthInBeginningOfChart
  const latestValue = totalAmountWorth

  const deltaPercentage = initialValue > 0 ? Math.round(((latestValue - initialValue) / initialValue) * 10000) / 100 : 0

  return deltaPercentage
}

export default useWorthDeltaPercentage
