import { node as n, NodeProvider, TransactionBuilder } from '@alephium/web3'

import { SweepTxParams } from '@/types/transactions'

// Delete when https://github.com/alephium/alephium-web3/pull/515 is merged and a new version is published
export abstract class AlephiumWalletTxBuilder extends TransactionBuilder {
  static from(nodeProvider: NodeProvider): AlephiumWalletTxBuilder
  static from(baseUrl: string, apiKey?: string, customFetch?: typeof fetch): AlephiumWalletTxBuilder
  static from(param0: string | NodeProvider, param1?: string, customFetch?: typeof fetch): AlephiumWalletTxBuilder {
    const nodeProvider =
      typeof param0 === 'string' ? new NodeProvider(param0, param1, customFetch) : (param0 as NodeProvider)
    return new (class extends AlephiumWalletTxBuilder {
      get nodeProvider(): NodeProvider {
        return nodeProvider
      }
    })()
  }

  async buildSweepTxs(params: SweepTxParams, publicKey: string): Promise<n.BuildSweepAddressTransactionsResult> {
    const data = this.buildSweepTxParams(params, publicKey)
    const response = await this.nodeProvider.transactions.postTransactionsSweepAddressBuild(data)

    return response
  }

  private buildSweepTxParams(params: SweepTxParams, publicKey: string): n.BuildSweepAddressTransactions {
    return {
      fromPublicKey: publicKey,
      fromPublicKeyType: params.signerKeyType,
      ...params
    }
  }
}
