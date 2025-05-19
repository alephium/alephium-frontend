import { ActiveWalletDesktop, AddressBase } from '@alephium/shared'

import { TimeInMs } from '@/types/numbers'

export type GeneratedWallet = {
  wallet: StoredEncryptedWallet
  initialAddress: AddressBase
}

// encrypted is a stringified instance of DeprecatedEncryptedMnemonicStoredAsString or EncryptedMnemonicStoredAsUint8Array
// containing the mnemonic together with metadata.
export type StoredEncryptedWallet = Omit<ActiveWalletDesktop, 'isPassphraseUsed'> & {
  encrypted: string
  lastUsed: TimeInMs
}
