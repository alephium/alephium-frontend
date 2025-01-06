import { AddressHash, AddressIndex, AddressMetadata, AddressSettings, BalanceHistory } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { AddressTokenBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { EntityState } from '@reduxjs/toolkit'

import { TimeInMs } from '~/types/numbers'
import { PendingTransaction } from '~/types/transactions'

export type Address = Omit<explorer.AddressInfo, 'txNumber'> & {
  index: number
  hash: AddressHash
  group: number
  settings: AddressSettings
  transactions: (explorer.Transaction['hash'] | PendingTransaction['hash'])[]
  allTransactionPagesLoaded: boolean
  tokens: AddressTokenBalance[]
  lastUsed: TimeInMs
  balanceHistory: EntityState<BalanceHistory>
}

export type AddressPartial = {
  index: number
  hash: AddressHash
  settings: AddressSettings
}

export type AddressDiscoveryGroupData = {
  highestIndex: AddressIndex | undefined
  gap: number
}

export type AddressTransactionsSyncResult = {
  hash: AddressHash
  transactions: explorer.Transaction[]
  mempoolTransactions: explorer.MempoolTransaction[]
}

export type AddressesHistoricalBalanceResult = {
  address: AddressHash
  balances: BalanceHistory[]
}[]

export type AddressMetadataWithHash = AddressMetadata & { hash: string }
