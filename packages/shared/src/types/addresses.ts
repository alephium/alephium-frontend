import { KeyType, Optional } from '@alephium/web3'
import { EntityState } from '@reduxjs/toolkit'

import { StringAlias } from '@/types/utils'

export type Contact = {
  id: string
  name: string
  address: AddressHash
}

export type ContactFormData = Optional<Contact, 'id'>

export type AddressHash = string & StringAlias

export type AddressSettings = {
  isDefault: boolean
  color: string
  label?: string
}

export type AddressIndex = number

// index: number
// isDefault: boolean
// color: string
// label?: string
export type AddressStoredMetadataWithoutHash = AddressSettings & {
  index: AddressIndex
  keyType?: KeyType
}

export type AddressStoredMetadataWithHash = AddressStoredMetadataWithoutHash & {
  hash: string
}

// hash: AddressHash
// index: number
// isDefault: boolean
// color: string
// label?: string
export type AddressBase = AddressStoredMetadataWithoutHash & {
  hash: AddressHash
  publicKey: string // TODO: Replace by NonSensitiveAddressData by moving it to shared?
}

// hash: AddressHash
// index: number
// group: number
// isDefault: boolean
// color: string
// label?: string
export type Address = AddressBase & {
  group: number
}

export type AddressesState = EntityState<Address>
