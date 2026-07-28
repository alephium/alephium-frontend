import { getHumanReadableError } from '@alephium/shared'

export type SwapErrorKind = 'insufficient_balance' | 'unknown'

export const classifySwapError = (error: unknown): { kind: SwapErrorKind; raw: string } => {
  const raw = getHumanReadableError(error, '')

  const kind: SwapErrorKind = /not enough (approved )?balance|insufficient (funds|balance)/i.test(raw)
    ? 'insufficient_balance'
    : 'unknown'

  return { kind, raw }
}
