import {
  SwapExecutionEvent,
  swapExecutionInitialState,
  swapExecutionReducer
} from '~/features/swap/swapExecutionMachine'
import { SwapExecution } from '~/features/swap/swapTypes'

const signing: SwapExecution = { status: 'signing' }
const submitted: SwapExecution = { status: 'submitted', txHash: 'tx1' }
const errored: SwapExecution = { status: 'error', message: 'nope', details: 'raw' }

describe('swapExecutionReducer', () => {
  it('walks the happy path idle → signing → submitted → idle', () => {
    let state = swapExecutionInitialState
    expect(state.status).toBe('idle')

    state = swapExecutionReducer(state, { type: 'SUBMIT' })
    expect(state.status).toBe('signing')

    state = swapExecutionReducer(state, { type: 'SUBMITTED', txHash: 'tx1' })
    expect(state).toEqual({ status: 'submitted', txHash: 'tx1' })

    state = swapExecutionReducer(state, { type: 'RESET' })
    expect(state.status).toBe('idle')
  })

  it('resets to idle from submitted (the Done action, once the tx settles off-machine)', () => {
    expect(swapExecutionReducer(submitted, { type: 'RESET' })).toEqual({ status: 'idle' })
  })

  it('handles the failure path and allows retry or reset', () => {
    const failed = swapExecutionReducer(signing, { type: 'FAILED', message: 'nope', details: 'raw' })
    expect(failed).toEqual({ status: 'error', message: 'nope', details: 'raw' })

    expect(swapExecutionReducer(errored, { type: 'SUBMIT' })).toEqual({ status: 'signing' })
    expect(swapExecutionReducer(errored, { type: 'RESET' })).toEqual({ status: 'idle' })
  })

  it('ignores illegal transitions (returns the same state)', () => {
    expect(swapExecutionReducer(swapExecutionInitialState, { type: 'SUBMITTED', txHash: 'x' })).toBe(
      swapExecutionInitialState
    )
    expect(swapExecutionReducer(swapExecutionInitialState, { type: 'FAILED', message: 'm' })).toBe(
      swapExecutionInitialState
    )
    expect(swapExecutionReducer(signing, { type: 'SUBMIT' })).toBe(signing)
    expect(swapExecutionReducer(signing, { type: 'RESET' })).toBe(signing)
    expect(swapExecutionReducer(submitted, { type: 'SUBMITTED', txHash: 'x' })).toBe(submitted)
    expect(swapExecutionReducer(submitted, { type: 'FAILED', message: 'm' })).toBe(submitted)
    expect(swapExecutionReducer(errored, { type: 'SUBMITTED', txHash: 'x' })).toBe(errored)
  })

  it('never throws for any (state, event) pair', () => {
    const states: SwapExecution[] = [swapExecutionInitialState, signing, submitted, errored]
    const events: SwapExecutionEvent[] = [
      { type: 'SUBMIT' },
      { type: 'SUBMITTED', txHash: 'x' },
      { type: 'FAILED', message: 'm', details: 'd' },
      { type: 'RESET' }
    ]

    states.forEach((state) => {
      events.forEach((event) => {
        expect(() => swapExecutionReducer(state, event)).not.toThrow()
      })
    })
  })
})
