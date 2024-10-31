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

import { PRICED_TOKENS } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { tokensPriceQuery } from '@/api/queries/priceQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

const useFetchTokenPrices = (props?: SkipProp) => {
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const networkIsOffline = useAppSelector(selectCurrentlyOnlineNetworkId) === undefined

  const { data, isLoading } = useQuery(
    tokensPriceQuery({
      symbols: PRICED_TOKENS,
      currency: fiatCurrency.toLowerCase(),
      skip: props?.skip || networkIsOffline
    })
  )

  return {
    data,
    isLoading
  }
}

export default useFetchTokenPrices

export const useFetchTokenPrice = (symbol: string) => {
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const networkIsOffline = useAppSelector(selectCurrentlyOnlineNetworkId) === undefined

  const { data, isLoading } = useQuery({
    ...tokensPriceQuery({ symbols: PRICED_TOKENS, currency: fiatCurrency.toLowerCase(), skip: networkIsOffline }),
    select: (data) => data.find((tokenPrice) => tokenPrice.symbol === symbol)?.price
  })

  return {
    data,
    isLoading
  }
}
