import { NonSensitiveAddressData } from '@alephium/keyring'
import { AddressBalancesSyncResult, AddressHash, AddressSettings, AddressTokensSyncResult } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { EntityState } from '@reduxjs/toolkit'

export enum AddressOrder {
  LastUse = 'lastUse',
  AlphValue = 'alphValue',
  Alphabetical = 'alphabetical'
}

export type DeprecatedAddressSettings = {
  isMain: boolean
  label?: string
  color?: string
}

export type DeprecatedAddressMetadata = DeprecatedAddressSettings & {
  index: number
}

export type AddressBase = AddressSettings & NonSensitiveAddressData

export type Address = AddressBase & {
  group: number
}

export type LoadingEnabled = boolean | undefined

export type AddressDataSyncResult = AddressBalancesSyncResult & AddressTokensSyncResult & AddressTransactionsSyncResult

export interface AddressesState extends EntityState<Address> {
  orderPreference: Record<string, AddressOrder>
  isRestoringAddressesFromMetadata: boolean
}

export type AddressTransactionsSyncResult = {
  hash: AddressHash
  transactions: e.Transaction[]
}
