import { AddressHash, AddressMetadata, Contact, ContactFormData } from '@alephium/shared'

import { AddressMetadataWithHash } from '~/types/addresses'

export type DeprecatedMnemonic = string

export type WalletMetadata = {
  id: string
  name: string
  isMnemonicBackedUp: boolean
  addresses: AddressMetadataWithHash[]
  contacts: Contact[]
}

export type DeprecatedWalletMetadata = {
  id: string
  name: string
  isMnemonicBackedUp: boolean
  addresses: AddressMetadata[]
  contacts: Contact[]
}

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
  firstAddress: {
    hash: AddressHash
    index: number
  }
}

export type WalletImportData = {
  mnemonic: string
  addresses: AddressMetadata[]
  contacts: ContactFormData[]
}
