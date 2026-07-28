import type { ComputeErrorCode, SwapComputeResult } from '@alephium/powfi-backend'

// 'sell' = exact-in (user sets the input amount), 'buy' = exact-out (user sets the output amount).
export type SwapDirection = 'sell' | 'buy'

export type SwapQuote = SwapComputeResult

// The Eden client throws this shape as error.value on a failed quote.
export interface SwapQuoteError {
  code?: ComputeErrorCode
  message: string
  details?: Record<string, unknown>
}

export type SwapExecution =
  | { status: 'idle' }
  | { status: 'signing' }
  | { status: 'submitted'; txHash: string }
  | { status: 'error'; message: string; details?: string } // message = friendly, details = raw (collapsed)
