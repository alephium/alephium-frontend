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

import { CliqueClient } from './clique'
import * as api from '../api/api-alephium'

export class Signer {
  client: CliqueClient
  walletName: string
  address: string

  private _publicKey?: string

  constructor(client: CliqueClient, walletName: string, address: string) {
    this.client = client
    this.walletName = walletName
    this.address = address
  }

  static testSigner(client: CliqueClient): Signer {
    return new Signer(client, 'alephium-js-sdk-test-only-wallet', '12LgGdbjE6EtnTKw5gdBwV2RRXuXPtzYM7SDZ45YJTRht')
  }

  async getPublicKey(): Promise<string> {
    if (this._publicKey) {
      return this._publicKey
    } else {
      const response = await this.client.wallets.getWalletsWalletNameAddressesAddress(this.walletName, this.address)
      this._publicKey = CliqueClient.convert(response).publicKey
      return this._publicKey
    }
  }

  async sign(hash: string): Promise<string> {
    const response = await this.client.wallets.postWalletsWalletNameSign(this.walletName, { data: hash })
    return CliqueClient.convert(response).signature
  }

  async submitTransaction(unsignedTx: string, txHash: string): Promise<SubmissionResult> {
    const signature = await this.sign(txHash)
    const params: api.SubmitTransaction = { unsignedTx: unsignedTx, signature: signature }
    const response = await this.client.transactions.postTransactionsSubmit(params)
    return fromApiSubmissionResult(CliqueClient.convert(response))
  }
}

export interface SubmissionResult {
  txId: string
  fromGroup: number
  toGroup: number
}

function fromApiSubmissionResult(result: api.TxResult): SubmissionResult {
  return result
}
