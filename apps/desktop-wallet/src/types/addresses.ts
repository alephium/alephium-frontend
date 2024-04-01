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

import { NonSensitiveAddressData } from '@alephium/keyring'
import {
  AddressBalancesSyncResult,
  AddressHash,
  AddressSettings,
  AddressTokensSyncResult,
  BalanceHistory
} from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { AddressTokenBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { EntityState } from '@reduxjs/toolkit'

import { TimeInMs } from '@/types/numbers'
import { PendingTransaction } from '@/types/transactions'

export type DeprecatedAddressSettings = {
  isMain: boolean
  label?: string
  color?: string
}

export type DeprecatedAddressMetadata = DeprecatedAddressSettings & {
  index: number
}

export type AddressBase = AddressSettings & NonSensitiveAddressData

export type Address = AddressBase &
  explorer.AddressInfo & {
    group: number
    transactions: (explorer.Transaction['hash'] | PendingTransaction['hash'])[]
    transactionsPageLoaded: number
    allTransactionPagesLoaded: boolean
    tokens: AddressTokenBalance[]
    lastUsed: TimeInMs
    alphBalanceHistory: EntityState<BalanceHistory>
    alphBalanceHistoryInitialized: boolean
  }

export type LoadingEnabled = boolean | undefined

export type AddressDataSyncResult = AddressBalancesSyncResult & AddressTokensSyncResult & AddressTransactionsSyncResult

export interface AddressesState extends EntityState<Address> {
  loadingBalances: boolean
  loadingTransactions: boolean
  loadingTokensBalances: boolean
  syncingAddressData: boolean
  isRestoringAddressesFromMetadata: boolean
  status: 'uninitialized' | 'initialized'
  balancesStatus: 'uninitialized' | 'initialized'
}

export type AddressTransactionsSyncResult = {
  hash: AddressHash
  txNumber: explorer.AddressInfo['txNumber']
  transactions: explorer.Transaction[]
  mempoolTransactions: explorer.MempoolTransaction[]
}
