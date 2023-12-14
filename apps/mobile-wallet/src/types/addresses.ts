/*
Copyright 2018 - 2023 The Alephium Authors
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

import { AddressHash } from '@alephium/shared'
import { AddressKeyPair } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { AddressTokenBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { EntityState } from '@reduxjs/toolkit'

import { TimeInMs } from '~/types/numbers'
import { PendingTransaction } from '~/types/transactions'

export type AddressIndex = number

export type AddressSettings = {
  isDefault: boolean
  label?: string
  color?: string
}

export type AddressMetadata = AddressSettings & {
  index: AddressIndex
}

export type Address = AddressKeyPair &
  Omit<explorer.AddressInfo, 'txNumber'> & {
    group: number
    settings: AddressSettings
    transactions: (explorer.Transaction['hash'] | PendingTransaction['hash'])[]
    transactionsPageLoaded: number
    allTransactionPagesLoaded: boolean
    tokens: AddressTokenBalance[]
    lastUsed: TimeInMs
    balanceHistory: EntityState<BalanceHistory>
    balanceHistoryInitialized: boolean
  }

export type AddressPartial = AddressKeyPair & { settings: AddressSettings }

export type AddressDiscoveryGroupData = {
  highestIndex: AddressIndex | undefined
  gap: number
}

export type AddressTransactionsSyncResult = {
  hash: AddressHash
  transactions: explorer.Transaction[]
  mempoolTransactions: explorer.MempoolTransaction[]
}

export type AddressTokensSyncResult = {
  hash: AddressHash
  tokenBalances: AddressTokenBalance[]
}

export type AddressBalancesSyncResult = Omit<explorer.AddressInfo, 'txNumber'> & {
  hash: AddressHash
}

// Same as in desktop wallet
export type BalanceHistory = {
  date: string // CHART_DATE_FORMAT
  balance: string
}

export type AddressesHistoricalBalanceResult = {
  address: AddressHash
  balances: BalanceHistory[]
}[]
