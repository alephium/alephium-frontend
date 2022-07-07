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

import { Api } from '../api/api-alephium'

/**
 * Node client
 */

export class NodeClient extends Api<null> {
  async getBalance(address: string) {
    return await this.addresses.getAddressesAddressBalance(address)
  }

  async transactionCreate(
    fromPublicKey: string,
    toAddress: string,
    amount: string,
    lockTime?: number,
    gas?: number,
    gasPrice?: string
  ) {
    return await this.transactions.postTransactionsBuild({
      fromPublicKey,
      destinations: [{ address: toAddress, alphAmount: amount, lockTime }],
      gas,
      gasPrice
    })
  }

  async transactionConsolidateUTXOs(fromPublicKey: string, toAddress: string) {
    return await this.transactions.postTransactionsSweepAddressBuild({
      fromPublicKey,
      toAddress
    })
  }

  async transactionSend(tx: string, signature: string) {
    return await this.transactions.postTransactionsSubmit({ unsignedTx: tx, signature })
  }
}
