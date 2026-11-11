import { AddressHash } from '@alephium/shared/types'
import { createAction } from '@reduxjs/toolkit'

export const addressMigrated = createAction<{ fromAddressHash: AddressHash; toAddressHash: AddressHash }>(
  'addressMigration/addressMigrated'
)
