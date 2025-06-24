import { AddressStoredMetadataWithHash, AddressStoredMetadataWithoutHash, Contact } from '@/types/addresses'

export type WalletMetadataMobile = {
  id: string
  name: string
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
