import { SwapExecution } from '~/features/swap/swapTypes'

export type SwapExecutionEvent =
  | { type: 'SUBMIT' }
  | { type: 'SUBMITTED'; txHash: string }
  | { type: 'FAILED'; message: string; details?: string }
  | { type: 'RESET' }

export const swapExecutionInitialState: SwapExecution = { status: 'idle' }

export const swapExecutionReducer = (state: SwapExecution, event: SwapExecutionEvent): SwapExecution => {
  switch (state.status) {
    case 'idle':
      return event.type === 'SUBMIT' ? { status: 'signing' } : state

    case 'signing':
      if (event.type === 'SUBMITTED') return { status: 'submitted', txHash: event.txHash }
      if (event.type === 'FAILED') return { status: 'error', message: event.message, details: event.details }
      return state

    case 'submitted':
      return event.type === 'RESET' ? { status: 'idle' } : state

    case 'error':
      if (event.type === 'SUBMIT') return { status: 'signing' }
      if (event.type === 'RESET') return { status: 'idle' }
      return state
  }
}
