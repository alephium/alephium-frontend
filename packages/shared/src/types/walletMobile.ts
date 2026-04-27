import { AddressStoredMetadataWithHash, AddressStoredMetadataWithoutHash, Contact } from '../types/addresses'

export type WalletType = 'seed' | 'watch-only'

export type WalletListEntry = {
  id: string
  name: string
  type: WalletType
  lastUsed: number
  order: number
}

export type WalletMetadataMobile = {
  id: string
  name: string
  type?: WalletType
  isMnemonicBackedUp: boolean
  addresses: AddressStoredMetadataWithHash[]
  contacts: Contact[]
}

export type DeprecatedWalletMetadataMobile = {
  id: string
  name: string
  isMnemonicBackedUp: boolean
  addresses: AddressStoredMetadataWithoutHash[]
  contacts: Contact[]
}
