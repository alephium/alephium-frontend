import { DecodeUnsignedTxResult } from '@alephium/web3/dist/src/api/api-alephium'

import { SignMessageData, SignUnsignedTxData } from '~/types/transactions'

export type SessionRequestData =
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
