import { Account, KeyType, node as n, SignerProviderSimple } from '@alephium/web3'

import { throttledClient } from '@/api/throttledClient'

export abstract class AlephiumWalletSigner extends SignerProviderSimple {
  public get nodeProvider() {
    return throttledClient.node
  }

  public get explorerProvider() {
    return throttledClient.explorer
  }

  protected unsafeGetSelectedAccount(): Promise<Account> {
    throw Error('Not implemented')
  }

  // Delete when https://github.com/alephium/alephium-web3/pull/515 is merged and a new version is published
  public signAndSubmitSweepTxs = async (params: SweepTxParams) => {
    const { unsignedTxs } = await throttledClient.txBuilder.buildSweepTxs(
      params,
      await this.getPublicKey(params.signerAddress)
    )

    const results = []

    for (const { txId, unsignedTx } of unsignedTxs) {
      const signature = await this.signRaw(params.signerAddress, txId)
      const result = await this.submitTransaction({ unsignedTx, signature })

      results.push(result)
    }

    return results
  }
}

export interface SweepTxParams extends Omit<n.BuildSweepAddressTransactions, 'fromPublicKey' | 'fromPublicKeyType'> {
  signerAddress: string
  signerKeyType?: KeyType
}
