import { Address } from '@alephium/shared'
import { SignMessageParams } from '@alephium/web3'

export interface SignUnsignedTxData {
  fromAddress: Address
  unsignedTx: string
}

export interface SignMessageData extends Pick<SignMessageParams, 'message' | 'messageHasher'> {
  fromAddress: Address
}
