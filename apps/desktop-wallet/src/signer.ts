import { keyring } from '@alephium/keyring'
import { AlephiumWalletSigner, SweepTxParams, throttledClient } from '@alephium/shared'
import {
  GroupedKeyType,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  TransactionBuilder
} from '@alephium/web3'

import { LedgerAlephium } from '@/features/ledger/utils'

interface LedgerTxParams {
  signerIndex: number
  signerKeyType: GroupedKeyType
  onLedgerError: (error: Error) => void
}

class InMemorySigner extends AlephiumWalletSigner {
  public getPublicKey = async (addressStr: string): Promise<string> => keyring.exportPublicKeyOfAddress(addressStr)

  public signRaw = async (address: string, tx: string): Promise<string> => keyring.signTransaction(tx, address)

  public signAndSubmitTransferTxLedger = async (
    params: SignTransferTxParams,
    ledgerParams: LedgerTxParams
  ): Promise<SignTransferTxResult> => {
    const buildResult = await this.buildTransferTx(params)
    const s = await this._signAndSubmitUnsignedTxLedger({ ...params, unsignedTx: buildResult.unsignedTx }, ledgerParams)

    return { ...buildResult, signature: s }
  }

  public signAndSubmitExecuteScriptTxLedger = async (
    params: SignExecuteScriptTxParams,
    ledgerParams: LedgerTxParams
  ): Promise<SignExecuteScriptTxResult> => {
    const buildResult = await this.buildExecuteScriptTx(params)
    const s = await this._signAndSubmitUnsignedTxLedger({ ...params, unsignedTx: buildResult.unsignedTx }, ledgerParams)

    return { ...buildResult, signature: s }
  }

  public signAndSubmitDeployContractTxLedger = async (
    params: SignDeployContractTxParams,
    ledgerParams: LedgerTxParams
  ): Promise<SignDeployContractTxResult> => {
    const buildResult = await this.buildDeployContractTx(params)
    const s = await this._signAndSubmitUnsignedTxLedger({ ...params, unsignedTx: buildResult.unsignedTx }, ledgerParams)

    return { ...buildResult, signature: s }
  }

  public signAndSubmitSweepTxsLedger = async (params: SweepTxParams, ledgerParams: LedgerTxParams) => {
    const { unsignedTxs } = await throttledClient.txBuilder.buildSweepTxs(
      params,
      await this.getPublicKey(params.signerAddress)
    )

    const results = []

    for (const { txId, unsignedTx } of unsignedTxs) {
      results.push({
        txId,
        signature: await this._signAndSubmitUnsignedTxLedger({ ...params, unsignedTx }, ledgerParams)
      })
    }

    return results
  }

  public signUnsignedTxLedger = async (params: SignUnsignedTxParams, ledgerParams: LedgerTxParams) => {
    const buildResult = TransactionBuilder.buildUnsignedTx(params)
    const signature = await this._signUnsignedTxLedger(params, ledgerParams)

    return { ...buildResult, signature }
  }

  public signAndSubmitUnsignedTxLedger = async (params: SignUnsignedTxParams, ledgerParams: LedgerTxParams) => {
    const result = await this.signUnsignedTxLedger(params, ledgerParams)

    await this.submitTransaction({ unsignedTx: params.unsignedTx, signature: result.signature })

    return result
  }

  private _signAndSubmitUnsignedTxLedger = async (params: SignUnsignedTxParams, ledgerParams: LedgerTxParams) => {
    const signature = await this._signUnsignedTxLedger(params, ledgerParams)

    await this.submitTransaction({ unsignedTx: params.unsignedTx, signature })

    return signature
  }

  private _signUnsignedTxLedger = async (
    params: SignUnsignedTxParams,
    { signerIndex, onLedgerError }: LedgerTxParams
  ) => {
    const signature = await LedgerAlephium.create()
      .catch(onLedgerError)
      .then((app) => (app ? app.signUnsignedTx(signerIndex, params.unsignedTx) : null))

    if (!signature) {
      throw Error('Ledger error')
    }

    return signature
  }
}

export const signer = new InMemorySigner()
