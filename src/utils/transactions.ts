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

import { Output, Transaction } from '@alephium/sdk/api/explorer'

import { Address } from '../store/addressesSlice'
import { AddressPendingTransaction, AddressTransaction, PendingTransaction } from '../types/transactions'

export const getNewTransactions = (
  incomingTransactions: Transaction[],
  existingTransactions: Transaction[]
): Transaction[] =>
  incomingTransactions.filter((newTx) => !existingTransactions.some((existingTx) => existingTx.hash === newTx.hash))

export const getRemainingPendingTransactions = (
  existingPendingTransactions: PendingTransaction[],
  incomingTransactions: Transaction[]
) =>
  existingPendingTransactions.filter(
    (existingPendingTx) => !incomingTransactions.some((newTx) => newTx.hash === existingPendingTx.hash)
  )

export const isPendingTx = (tx: AddressTransaction): tx is AddressPendingTransaction =>
  (tx as AddressPendingTransaction).status === 'pending'

export const hasOnlyOutputsWith = (outputs: Output[], addresses: Address[]): boolean =>
  outputs.every((o) => o?.address && addresses.map((a) => a.hash).indexOf(o.address) >= 0)
