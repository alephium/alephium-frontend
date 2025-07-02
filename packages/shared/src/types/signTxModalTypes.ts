import {
  BuildTxResult,
  node as n,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignMessageParams,
  SignMessageResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult
} from '@alephium/web3'

export type ModalOrigin = 'walletconnect' | 'in-app-browser'

export type SignTxModalCommonProps = {
  onError: (message: string) => void
  origin: ModalOrigin
  dAppUrl?: string
  dAppIcon?: string
}

export interface SignTransferTxModalProps extends SignTxModalCommonProps {
  txParams: SignTransferTxParams
  unsignedData: BuildTxResult<SignTransferTxResult>
  onSuccess: (signResult: SignTransferTxResult) => void
}

export interface SignExecuteScriptTxModalProps extends SignTxModalCommonProps {
  txParams: SignExecuteScriptTxParams
  unsignedData: BuildTxResult<SignExecuteScriptTxResult>
  onSuccess: (signResult: SignExecuteScriptTxResult) => void
}

export interface SignDeployContractTxModalProps extends SignTxModalCommonProps {
  txParams: SignDeployContractTxParams
  unsignedData: BuildTxResult<SignDeployContractTxResult>
  onSuccess: (signResult: SignDeployContractTxResult) => void
}

export interface SignUnsignedTxModalProps extends SignTxModalCommonProps {
  txParams: SignUnsignedTxParams
  unsignedData: n.UnsignedTx
  submitAfterSign: boolean
  onSuccess: (signResult: SignUnsignedTxResult) => void
}

export interface SignMessageTxModalProps extends SignTxModalCommonProps {
  txParams: SignMessageParams
  unsignedData: string
  onSuccess: (signResult: SignMessageResult) => void
}
