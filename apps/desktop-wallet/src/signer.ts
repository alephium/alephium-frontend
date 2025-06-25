import { keyring } from '@alephium/keyring'
import { AlephiumWalletSigner } from '@alephium/shared'
import {
  GroupedKeyType,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignTransferTxParams,
  SignTransferTxResult
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
    { signerIndex, onLedgerError }: LedgerTxParams
  ): Promise<SignTransferTxResult> => {
    const buildResult = await this.buildTransferTx(params)

    return {
      ...buildResult,
      signature: await this.signAndSubmitLedgerTx(signerIndex, buildResult.unsignedTx, onLedgerError)
    }
  }

  public signAndSubmitExecuteScriptTxLedger = async (
    params: SignExecuteScriptTxParams,
    { signerIndex, onLedgerError }: LedgerTxParams
  ): Promise<SignExecuteScriptTxResult> => {
    const buildResult = await this.buildExecuteScriptTx(params)

    return {
      ...buildResult,
      signature: await this.signAndSubmitLedgerTx(signerIndex, buildResult.unsignedTx, onLedgerError)
    }
  }

  public signAndSubmitDeployContractTxLedger = async (
    params: SignDeployContractTxParams,
    { signerIndex, onLedgerError }: LedgerTxParams
  ): Promise<SignDeployContractTxResult> => {
    const buildResult = await this.buildDeployContractTx(params)

    return {
      ...buildResult,
      signature: await this.signAndSubmitLedgerTx(signerIndex, buildResult.unsignedTx, onLedgerError)
    }
  }

  private signAndSubmitLedgerTx = async (
    signerIndex: number,
    unsignedTx: string,
    onLedgerError: (error: Error) => void
  ) => {
    const signature = await LedgerAlephium.create()
      .catch(onLedgerError)
      .then((app) => (app ? app.signUnsignedTx(signerIndex, unsignedTx) : null))

    if (!signature) {
      throw Error('Ledger error')
    }

    await this.submitTransaction({ unsignedTx, signature })

    return signature
  }
}

export const signer = new InMemorySigner()
