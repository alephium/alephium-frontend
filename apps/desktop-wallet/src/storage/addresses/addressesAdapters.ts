import { createEntityAdapter } from '@reduxjs/toolkit'

import { Address } from '@/types/addresses'

export const addressesAdapter = createEntityAdapter<Address>({
  selectId: (address) => address.hash
})
