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

import { Currency } from '~/types/settings'

export const fetchLatestPrice = async (currency: Currency) => {
  console.log(`⬇️ Fetching latest ${currency} price`)

  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=alephium&vs_currencies=${currency}`)
  const data = await response.json()
  const latestPrice = data.alephium[currency.toLowerCase()]

  return latestPrice
}
