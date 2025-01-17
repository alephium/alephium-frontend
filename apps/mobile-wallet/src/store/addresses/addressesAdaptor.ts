import { createEntityAdapter } from '@reduxjs/toolkit'

import { Address } from '~/types/addresses'

export const addressesAdapter = createEntityAdapter<Address>({
  selectId: (address) => address.hash,
  sortComparer: (a, b) => {
    // Always keep main address to the top of the list
    if (a.settings.isDefault) return -1
    if (b.settings.isDefault) return 1
    return (b.lastUsed ?? 0) - (a.lastUsed ?? 0)
  }
})
