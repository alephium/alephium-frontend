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

import { AddressHash } from '../types/addresses'
import client from './client'

export const buildSweepTransactions = async (fromHash: AddressHash, fromPublicKey: string, toHash: AddressHash) => {
  const { data } = await client.cliqueClient.transactionConsolidateUTXOs(fromPublicKey, fromHash, toHash)
  const fees = data.unsignedTxs.reduce((acc, tx) => acc + BigInt(tx.gasPrice) * BigInt(tx.gasAmount), BigInt(0))

  return {
    unsignedTxs: data.unsignedTxs,
    fees
  }
}

export const signAndSendTransaction = async (
  fromHash: AddressHash,
  fromPrivateKey: string,
  txId: string,
  unsignedTx: string
) => {
  const signature = client.cliqueClient.transactionSign(txId, fromPrivateKey)
  const { data } = await client.cliqueClient.transactionSend(fromHash, unsignedTx, signature)

  return data
}
