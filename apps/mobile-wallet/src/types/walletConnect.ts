import { SignUnsignedTxParams } from '@alephium/web3'
import { DecodeUnsignedTxResult } from '@alephium/web3/dist/src/api/api-alephium'

import { SignMessageData } from '~/types/transactions'

export type SessionRequestData =
  | {
      type: 'sign-message'
      wcData: SignMessageData
      unsignedTxData?: undefined
    }
  | {
      type: 'sign-unsigned-tx'
      wcData: SignUnsignedTxParams
      unsignedTxData: DecodeUnsignedTxResult
      submit: boolean
    }
