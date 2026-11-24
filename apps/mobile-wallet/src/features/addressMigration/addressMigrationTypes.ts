import { AddressHash } from '@alephium/shared/types'

export type AddressMigrationStep = 'preparing' | 'signing' | 'submitted'

export type AddressMigrationExecution =
  | { status: 'idle' }
  | { status: 'preparing' }
  | { status: 'signing'; toAddressHash: AddressHash; fee: bigint }
  | { status: 'submitted'; toAddressHash: AddressHash; fee: bigint; txHashes: string[] }
  | { status: 'done'; toAddressHash: AddressHash }
  | {
      status: 'error'
      failedAt: AddressMigrationStep
      message: string
      details?: string
      someTxsBroadcast?: boolean
    }
