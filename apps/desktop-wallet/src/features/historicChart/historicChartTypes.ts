import { AddressHash } from '@alephium/shared'

export type LatestAmountPerAddress = Record<AddressHash, bigint>

export type DataPoint = {
  date: string
  worth: number
}

export const chartLengths = ['1d', '1w', '1m', '1y'] as const

type ChartLengthType = typeof chartLengths
export type ChartLength = ChartLengthType[number]
