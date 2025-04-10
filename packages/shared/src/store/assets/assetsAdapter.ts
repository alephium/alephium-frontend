import { createEntityAdapter } from '@reduxjs/toolkit'

import { FungibleToken } from '@/types/assets'

export const fungibleTokensAdapter = createEntityAdapter<FungibleToken>({
  sortComparer: (a, b) => a.name.localeCompare(b.name)
})
