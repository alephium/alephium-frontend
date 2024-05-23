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

import { Currency } from '@/types/currencies'

type CurrencyData = {
  name: string
  ticker: Currency
  symbol: string
}

export const CURRENCIES: Record<Currency, CurrencyData> = {
  CHF: {
    name: 'Swiss francs',
    ticker: 'CHF',
    symbol: 'CHF'
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
  }
}
