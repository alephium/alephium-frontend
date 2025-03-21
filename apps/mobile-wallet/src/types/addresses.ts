import { AddressHash, AddressIndex, AddressMetadata, AddressSettings } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { AddressTokenBalance } from '@alephium/web3/dist/src/api/api-explorer'

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

export type AddressMetadataWithHash = AddressMetadata & { hash: string }
