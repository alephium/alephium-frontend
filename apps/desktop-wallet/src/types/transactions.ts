import { AddressHash } from '@alephium/shared'

export type TransactionTimePeriod = '24h' | '1w' | '1m' | '6m' | '12m' | 'previousYear' | 'thisYear'

export type Direction = 'received' | 'sent' | 'moved' | 'swapped' | 'dApp'

export type CsvExportTimerangeQueryParams = {
  fromTs: number
  toTs: number
}

export type CsvExportQueryParams = CsvExportTimerangeQueryParams & {
  addressHash: AddressHash
}
