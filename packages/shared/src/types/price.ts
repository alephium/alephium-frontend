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
