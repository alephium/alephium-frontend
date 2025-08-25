import {
  BuildTxResult,
  explorer as e,
  SignChainedTxParams,
  SignDeployContractChainedTxResult,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptChainedTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignMessageParams,
  SignMessageResult,
  SignTransferChainedTxResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult
} from '@alephium/web3'

import { SweepTxParams } from '@/types/transactions'

export type ModalOrigin =
  | 'walletconnect'
  | 'in-app-browser'
  | 'walletconnect:insufficient-funds'
  | 'in-app-browser:insufficient-funds'

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
  unsignedData: e.AcceptedTransaction
  submitAfterSign: boolean
  onSuccess: (signResult: SignUnsignedTxResult) => void
}

export interface SignMessageTxModalProps extends SignTxModalCommonProps {
  txParams: SignMessageParams
  unsignedData: string
  onSuccess: (signResult: SignMessageResult) => void
}

export interface ConsolidationTxModalProps {
  txParams: SweepTxParams
  onSuccess: () => void
  fees: bigint
}

export type SignTxModalType =
  | 'TRANSFER'
  | 'DEPLOY_CONTRACT'
  | 'EXECUTE_SCRIPT'
  | 'UNSIGNED_TX'
  | 'MESSAGE'
  | 'CHAINED'
  | 'CONSOLIDATE'

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
        unsignedData: Omit<SignTransferChainedTxResult, 'signature'>
      }
    | {
        type: 'DEPLOY_CONTRACT'
        txParams: SignDeployContractTxParams
        unsignedData: Omit<SignDeployContractChainedTxResult, 'signature'>
      }
    | {
        type: 'EXECUTE_SCRIPT'
        txParams: SignExecuteScriptTxParams
        unsignedData: Omit<SignExecuteScriptChainedTxResult, 'signature'>
      }
  >
  onSuccess: (signResult: SignChainedTxModalResult) => void
}
