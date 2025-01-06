import { AddressHash } from '@alephium/shared'
import { createAction } from '@reduxjs/toolkit'

export const addressDeleted = createAction<AddressHash>('addresses/addressDeleted')
