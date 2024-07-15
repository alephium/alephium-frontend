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

import { client, ONE_MINUTE_MS } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useQuery } from '@tanstack/react-query'

import { useAppSelector } from '@/hooks/redux'

const useAlphPrice = () => {
  const currency = useAppSelector((s) => s.settings.fiatCurrency).toLowerCase()
  const { data } = useQuery({
    queryKey: ['tokenPrice', ALPH.symbol, { currency }],
    queryFn: async () => (await client.explorer.market.postMarketPrices({ currency }, [ALPH.symbol]))[0],
    refetchInterval: ONE_MINUTE_MS
  })

  return data
}

export default useAlphPrice
