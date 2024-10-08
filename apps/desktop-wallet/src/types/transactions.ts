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

import { AddressHash, TransactionInfoType } from '@alephium/shared'
import { explorer } from '@alephium/web3'

import { Address } from '@/types/addresses'

export type PendingTransaction = {
  hash: string
  fromAddress: string
  toAddress: string
  timestamp: number
  type: 'consolidation' | 'transfer' | 'sweep' | 'contract'
  amount?: string
  tokens?: explorer.Token[]
  lockTime?: number
  status: 'pending'
}

export type AddressConfirmedTransaction = explorer.Transaction & { address: Address }
export type AddressPendingTransaction = PendingTransaction & { address: Address }
export type AddressTransaction = AddressConfirmedTransaction | AddressPendingTransaction

export type TransactionTimePeriod = '24h' | '1w' | '1m' | '6m' | '12m' | 'previousYear' | 'thisYear'

export type Direction = Omit<TransactionInfoType, 'pending'>

export type CsvExportTimerangeQueryParams = {
  fromTs: number
  toTs: number
}

export type CsvExportQueryParams = CsvExportTimerangeQueryParams & {
  addressHash: AddressHash
}
