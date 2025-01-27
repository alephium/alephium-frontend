import { Currency } from '@/types/currencies'

type CurrencyData = {
  name: string
  ticker: Currency
  symbol: string
}

export const CURRENCIES: Record<Currency, CurrencyData> = {
  CHF: {
    name: 'Swiss Franc',
    ticker: 'CHF',
    symbol: 'Fr.'
  },
  EUR: {
    name: 'Euro',
    ticker: 'EUR',
    symbol: '€'
  },
  GBP: {
    name: 'Great Britain Pound',
    ticker: 'GBP',
    symbol: '£'
  },
  USD: {
    name: 'United States Dollar',
    ticker: 'USD',
    symbol: '$'
  },
  TRY: {
    name: 'Turkish Lira',
    ticker: 'TRY',
    symbol: '₺'
  },
  VND: {
    name: 'Vietnamese Dong',
    ticker: 'VND',
    symbol: '₫'
  },
  RUB: {
    name: 'Russian Ruble',
    ticker: 'RUB',
    symbol: '₽'
  },
  IDR: {
    name: 'Rupiah',
    ticker: 'IDR',
    symbol: 'Rp'
  },
  CAD: {
    name: 'Canadian Dollar',
    ticker: 'CAD',
    symbol: 'CA$'
  },
  AUD: {
    name: 'Australian Dollar',
    ticker: 'AUD',
    symbol: 'A$'
  },
  THB: {
    name: 'Thai Baht',
    ticker: 'THB',
    symbol: '฿'
  },
  HKD: {
    name: 'Hong Kong Dollar',
    ticker: 'HKD',
    symbol: 'HK$'
  }
}
