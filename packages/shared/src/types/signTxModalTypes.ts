import {
  BuildTxResult,
  node as n,
  SignChainedTxParams,
  SignChainedTxResult,
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

export type SignTxModalType = 'TRANSFER' | 'DEPLOY_CONTRACT' | 'EXECUTE_SCRIPT' | 'UNSIGNED_TX' | 'MESSAGE' | 'CHAINED'

export type SignChainedTxModalResult = Array<
  | {
      type: 'TRANSFER'
      result: SignTransferTxResult
      txParams: SignTransferTxParams
    }
  | {
      type: 'DEPLOY_CONTRACT'
      result: SignDeployContractTxResult
      txParams: SignDeployContractTxParams
    }
  | {
      type: 'EXECUTE_SCRIPT'
      result: SignExecuteScriptTxResult
      txParams: SignExecuteScriptTxParams
    }
>

export interface SignChainedTxModalProps extends SignTxModalCommonProps {
  txParams: Array<SignChainedTxParams>
  props: Array<
    | {
        type: 'TRANSFER'
        txParams: SignTransferTxParams
        unsignedData: Omit<SignChainedTxResult, 'signature'>
      }
    | {
        type: 'DEPLOY_CONTRACT'
        txParams: SignDeployContractTxParams
        unsignedData: Omit<SignChainedTxResult, 'signature'>
      }
    | {
        type: 'EXECUTE_SCRIPT'
        txParams: SignExecuteScriptTxParams
        unsignedData: Omit<SignChainedTxResult, 'signature'>
      }
  >
  onSuccess: (signResult: SignChainedTxModalResult) => void
}
