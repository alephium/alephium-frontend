import { GroupedKeyType, GrouplessKeyType, KeyType, Optional } from '@alephium/web3'
import { EntityState } from '@reduxjs/toolkit'

import { StringAlias } from '../types/utils'

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

export type AddressStoredMetadataWithoutHash = AddressSettings & {
  index: AddressIndex
  keyType?: KeyType
}

export type AddressStoredMetadataWithHash = AddressStoredMetadataWithoutHash & {
  hash: string
}

export type AddressBase = AddressStoredMetadataWithoutHash & {
  hash: AddressHash
  publicKey: string // TODO: Replace by NonSensitiveAddressData by moving it to shared?
  isNew?: boolean
}

export type AddressWithGroup = AddressBase & {
  group: number
  keyType: GroupedKeyType
}

export type GrouplessAddress = AddressBase & {
  keyType: GrouplessKeyType
}

export type Address = AddressWithGroup | GrouplessAddress

export type AddressesState = EntityState<Address>

// The user-facing address kind chosen when creating an address, mapped to a key type at generation
// time: 'groupless' -> gl-secp256k1, 'grouped' -> default, 'schnorr' -> bip340-schnorr.
export type NewAddressType = 'groupless' | 'grouped' | 'schnorr'
