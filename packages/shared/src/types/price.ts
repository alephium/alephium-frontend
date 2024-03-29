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

import { EntityState } from '@reduxjs/toolkit'

export interface TokenPriceEntity {
  symbol: string
  price: number
}

export interface TokenHistoricalPrice {
  date: string
  value: number
}

export interface TokenPriceHistoryEntity {
  symbol: string
  history: TokenHistoricalPrice[]
  status: 'initialized' | 'uninitialized'
}

export interface PricesState extends EntityState<TokenPriceEntity> {
  loading: boolean
  status: 'uninitialized' | 'initialized'
}

export interface PricesHistoryState extends EntityState<TokenPriceHistoryEntity> {
  loading: boolean
}
