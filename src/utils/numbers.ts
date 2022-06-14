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

import { addApostrophes } from '@alephium/sdk'

const MONEY_SYMBOL = ['', 'K', 'M', 'B', 'T']

export const formatFiatAmountForDisplay = (amount: number): string => {
  if (amount <= 1000000) return addApostrophes(amount.toFixed(2))

  const tier = amount < 1000000000 ? 2 : amount < 1000000000000 ? 3 : 4
  const suffix = MONEY_SYMBOL[tier]
  const scale = Math.pow(10, tier * 3)
  const scaled = amount / scale

  return scaled.toFixed(2) + suffix
}
