import { explorer as e, Optional } from '@alephium/web3'
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
export type AddressMetadata = AddressSettings & {
  index: AddressIndex
}

// hash: AddressHash
// index: number
// isDefault: boolean
// color: string
// label?: string
export type AddressBase = AddressMetadata & {
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

export type AddressBalancesSyncResult = Omit<e.AddressInfo, 'txNumber'> & {
  hash: AddressHash
}

export type AddressTokensSyncResult = {
  hash: AddressHash
  tokenBalances: e.AddressTokenBalance[]
}

export type AddressesState = EntityState<Address>

export type DEPRECATED_Address = Omit<e.AddressInfo, 'txNumber'> &
  Address & {
    transactions: e.Transaction['hash'][]
    allTransactionPagesLoaded: boolean
    tokens: e.AddressTokenBalance[]
    lastUsed: number
  }
