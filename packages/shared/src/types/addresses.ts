import { explorer as e, Optional } from '@alephium/web3'

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

export type AddressMetadata = AddressSettings & {
  index: AddressIndex
}

export type AddressBalancesSyncResult = Omit<e.AddressInfo, 'txNumber'> & {
  hash: AddressHash
}

export type AddressTokensSyncResult = {
  hash: AddressHash
  tokenBalances: e.AddressTokenBalance[]
}

