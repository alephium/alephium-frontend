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

import { explorer } from '@alephium/web3'
import { useQuery } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { tokensPriceQuery } from '@/api/queries/priceQueries'
import { useAppSelector } from '@/hooks/redux'

const pricedTokens = Object.keys(explorer.TokensWithPrice)

const useFetchTokenPrices = (props?: SkipProp) => {
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)

  const { data, isLoading } = useQuery(
    tokensPriceQuery({ symbols: pricedTokens, currency: fiatCurrency.toLowerCase(), skip: props?.skip })
  )

  return {
    data,
    isLoading
  }
}

export default useFetchTokenPrices

export const useFetchTokenPrice = (symbol: string) => {
  const { data, isLoading } = useFetchTokenPrices()

  return {
    data: useMemo(() => data?.find((tokenPrice) => tokenPrice.symbol === symbol), [data, symbol]),
    isLoading
  }
}
