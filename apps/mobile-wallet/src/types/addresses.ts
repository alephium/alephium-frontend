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
import { AddressHash, AddressIndex, AddressSettings, BalanceHistory } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { AddressTokenBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { EntityState } from '@reduxjs/toolkit'

import { TimeInMs } from '~/types/numbers'
import { PendingTransaction } from '~/types/transactions'

export type Address = NonSensitiveAddressData &
  Omit<explorer.AddressInfo, 'txNumber'> & {
    group: number
    settings: AddressSettings
    transactions: (explorer.Transaction['hash'] | PendingTransaction['hash'])[]
    allTransactionPagesLoaded: boolean
    tokens: AddressTokenBalance[]
    lastUsed: TimeInMs
    balanceHistory: EntityState<BalanceHistory>
  }

export type AddressPartial = NonSensitiveAddressData & { settings: AddressSettings }

export type AddressDiscoveryGroupData = {
  highestIndex: AddressIndex | undefined
  gap: number
}

export type AddressTransactionsSyncResult = {
  hash: AddressHash
  transactions: explorer.Transaction[]
  mempoolTransactions: explorer.MempoolTransaction[]
}

export type AddressesHistoricalBalanceResult = {
  address: AddressHash
  balances: BalanceHistory[]
}[]
