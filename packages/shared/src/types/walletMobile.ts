import { AddressMetadata, AddressMetadataWithHash, Contact } from '@/types/addresses'

export type WalletMetadataMobile = {
  id: string
  name: string
  isMnemonicBackedUp: boolean
  addresses: AddressMetadataWithHash[]
  contacts: Contact[]
}

export type DeprecatedWalletMetadataMobile = {
  id: string
  name: string
  isMnemonicBackedUp: boolean
  addresses: AddressMetadata[]
  contacts: Contact[]
}
