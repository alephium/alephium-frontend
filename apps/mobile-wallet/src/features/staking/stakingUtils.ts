import { ALPH } from '@alephium/token-list'
import { prettifyTokenAmount } from '@alephium/web3'

export const formatTokenAmount = (amount: bigint, decimals: number): string =>
  prettifyTokenAmount(amount, decimals) || '0'

export const isClaimable = (amount: bigint): boolean => amount > BigInt(0.001 * Math.pow(10, ALPH.decimals))
