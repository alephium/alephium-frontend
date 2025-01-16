import { AddressHash, TransactionInfoType } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'

export type SentTransaction = {
  hash: string
  fromAddress: string
  toAddress: string
  timestamp: number
  type: 'consolidation' | 'transfer' | 'sweep' | 'contract' | 'faucet'
  amount?: string
  tokens?: e.Token[]
  lockTime?: number
  status: 'sent' | 'mempooled' | 'confirmed'
}

export type TransactionTimePeriod = '24h' | '1w' | '1m' | '6m' | '12m' | 'previousYear' | 'thisYear'

export type Direction = Omit<TransactionInfoType, 'pending'>

export type CsvExportTimerangeQueryParams = {
  fromTs: number
  toTs: number
}

export type CsvExportQueryParams = CsvExportTimerangeQueryParams & {
  addressHash: AddressHash
}
