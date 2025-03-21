import { NonSensitiveAddressData } from '@alephium/keyring'
import { AddressBase } from '@alephium/shared'

import { TimeInMs } from '@/types/numbers'

export type ActiveWallet = {
  id: string
  name: string
  isPassphraseUsed: boolean
  isLedger: boolean
}

export type GeneratedWallet = {
  wallet: StoredEncryptedWallet
  initialAddress: AddressBase
}

export type UnlockedWallet = {
  wallet: ActiveWallet
  initialAddress: NonSensitiveAddressData
}

// encrypted is a stringified instance of DeprecatedEncryptedMnemonicStoredAsString or EncryptedMnemonicStoredAsUint8Array
// containing the mnemonic together with metadata.
export type StoredEncryptedWallet = Omit<ActiveWallet, 'isPassphraseUsed'> & {
  encrypted: string
  lastUsed: TimeInMs
}
