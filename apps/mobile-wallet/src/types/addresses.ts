import { AddressHash, AddressIndex } from '@alephium/shared'
import { explorer } from '@alephium/web3'

export type AddressDiscoveryGroupData = {
  highestIndex: AddressIndex | undefined
  gap: number
}

export type AddressTransactionsSyncResult = {
  hash: AddressHash
  transactions: explorer.Transaction[]
  mempoolTransactions: explorer.MempoolTransaction[]
}
