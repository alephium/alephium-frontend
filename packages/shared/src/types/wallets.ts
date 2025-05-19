import { AddressBase } from '@/types'

export type UnlockedWallet = {
  wallet: {
    isPassphraseUsed?: boolean
  }
  initialAddress: AddressBase
}
