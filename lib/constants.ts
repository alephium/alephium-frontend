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

export const QUINTILLION = 1000000000000000000
export const NUM_OF_ZEROS_IN_QUINTILLION = 18
export const BILLION = 1000000000
export const TOTAL_NUMBER_OF_GROUPS = 4
export const MIN_UTXO_SET_AMOUNT = BigInt(1000000000000)
export const DUST_AMOUNT = BigInt('1000000000000000')
export const MINIMAL_GAS_AMOUNT = 20000
export const MINIMAL_GAS_PRICE = BigInt(BILLION * 100) // 100 nanoALPH for the first year to prevent DoS attacks
export const GENESIS_TIMESTAMP = 1231006505000
