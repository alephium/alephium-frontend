import {
  BuildDeployContractTxResult,
  BuildExecuteScriptTxResult,
  BuildTransferTxResult,
  DecodeUnsignedTxResult
} from '@alephium/web3/dist/src/api/api-alephium'

import {
  CallContractTxData,
  DeployContractTxData,
  SignMessageData,
  SignUnsignedTxData,
  TransferTxData
} from '~/types/transactions'

export type SessionRequestData =
  | {
      type: 'transfer'
      wcData: TransferTxData
      unsignedTxData: BuildTransferTxResult
    }
  | {
      type: 'call-contract'
      wcData: CallContractTxData
      unsignedTxData: BuildExecuteScriptTxResult
    }
  | {
      type: 'deploy-contract'
      wcData: DeployContractTxData
      unsignedTxData: BuildDeployContractTxResult
    }
  | {
      type: 'sign-message'
      wcData: SignMessageData
      unsignedTxData?: undefined
    }
  | {
      type: 'sign-unsigned-tx'
      wcData: SignUnsignedTxData
      unsignedTxData: DecodeUnsignedTxResult
      submit: boolean
    }
