import { SignDeployContractTxParams } from '@alephium/web3'
import {
  BuildDeployContractTxResult,
  BuildExecuteScriptTxResult,
  BuildTransferTxResult,
  DecodeUnsignedTxResult
} from '@alephium/web3/dist/src/api/api-alephium'

import {
  SignExecuteScriptTxParamsWithAmounts,
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
      wcData: SignExecuteScriptTxParamsWithAmounts
      unsignedTxData: BuildExecuteScriptTxResult
    }
  | {
      type: 'deploy-contract'
      wcData: SignDeployContractTxParams
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
