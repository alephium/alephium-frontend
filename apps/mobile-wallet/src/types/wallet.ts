import { NonSensitiveAddressData } from '@alephium/keyring'
import { AddressStoredMetadataWithoutHash, ContactFormData } from '@alephium/shared'

export type DeprecatedMnemonic = string

export interface WalletStoredState {
  name: string
  id: string
  isMnemonicBackedUp?: boolean
}

export interface WalletState extends WalletStoredState {
  isUnlocked: boolean
  metadataRestored: boolean
}

export interface DeprecatedWalletState extends WalletState {
  mnemonic: DeprecatedMnemonic
}

export type GeneratedWallet = WalletStoredState & {
  initialAddress: NonSensitiveAddressData
}

export type WalletImportData = {
  mnemonic: string
  addresses: AddressStoredMetadataWithoutHash[]
  contacts: ContactFormData[]
}
