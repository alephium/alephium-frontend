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

import { explorer } from '@alephium/web3'

import { AddressHash } from '~/types/addresses'

// TODO: Same as in desktop wallet, move to SDK?
export const extractNewTransactionHashes = (
  incomingTransactions: explorer.Transaction[],
  existingTransactions: explorer.Transaction['hash'][]
): explorer.Transaction['hash'][] =>
  incomingTransactions
    .filter((newTx) => !existingTransactions.some((existingTx) => existingTx === newTx.hash))
    .map((tx) => tx.hash)

// TODO: Same as in desktop wallet, move to SDK?
export const getTransactionsOfAddress = (transactions: explorer.Transaction[], addressHash: AddressHash) =>
  transactions.filter(
    (tx) =>
      tx.inputs?.some((input) => input.address === addressHash) ||
      tx.outputs?.some((output) => output.address === addressHash)
  )
