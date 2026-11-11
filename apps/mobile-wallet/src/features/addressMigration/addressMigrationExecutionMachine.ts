import { AddressHash } from '@alephium/shared/types'

import { AddressMigrationExecution, AddressMigrationStep } from '~/features/addressMigration/addressMigrationTypes'

export type AddressMigrationExecutionEvent =
  | { type: 'PREPARE' }
  | { type: 'PREPARED'; toAddressHash: AddressHash; fee: bigint }
  | { type: 'SUBMITTED'; txHashes: string[] }
  | { type: 'CONFIRMED' }
  | { type: 'FAILED'; message: string; details?: string; someTxsBroadcast?: boolean }
  | { type: 'RESET' }

export const addressMigrationExecutionInitialState: AddressMigrationExecution = { status: 'idle' }

export const addressMigrationExecutionReducer = (
  state: AddressMigrationExecution,
  event: AddressMigrationExecutionEvent
): AddressMigrationExecution => {
  switch (state.status) {
    case 'idle':
      return event.type === 'PREPARE' ? { status: 'preparing' } : state

    case 'preparing':
      if (event.type === 'PREPARED') return { status: 'signing', toAddressHash: event.toAddressHash, fee: event.fee }
      if (event.type === 'FAILED') return toError(event, state.status)
      return state

    case 'signing':
      if (event.type === 'SUBMITTED') return { ...state, status: 'submitted', txHashes: event.txHashes }
      if (event.type === 'FAILED') return toError(event, state.status)
      return state

    case 'submitted':
      if (event.type === 'CONFIRMED') return { status: 'done', toAddressHash: state.toAddressHash }
      if (event.type === 'FAILED') return toError(event, state.status)
      return state

    case 'done':
      return state

    case 'error':
      if (event.type === 'PREPARE') return { status: 'preparing' }
      if (event.type === 'RESET') return { status: 'idle' }
      return state
  }
}

const toError = (
  event: Extract<AddressMigrationExecutionEvent, { type: 'FAILED' }>,
  failedAt: AddressMigrationStep
): AddressMigrationExecution => ({
  status: 'error',
  failedAt,
  message: event.message,
  details: event.details,
  someTxsBroadcast: event.someTxsBroadcast
})
