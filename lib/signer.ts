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

  async getPublicKey(): Promise<string> {
    if (this._publicKey) {
      return this._publicKey
    } else {
      const response = await this.client.wallets.getWalletsWalletNameAddressesAddress(this.walletName, this.address)
      this._publicKey = response.data.publicKey
      return this._publicKey
    }
  }

  async sign(hash: string): Promise<string> {
    const response = await this.client.wallets.postWalletsWalletNameSign(this.walletName, { data: hash })
    return response.data.signature
  }

  async submitTransaction(unsignedTx: string, txHash: string): Promise<SubmissionResult> {
    const signature = await this.sign(txHash)
    const params: api.SubmitTransaction = { unsignedTx: unsignedTx, signature: signature }
    const response = await this.client.transactions.postTransactionsSubmit(params)
    return fromApiSubmissionResult(response.data)
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
