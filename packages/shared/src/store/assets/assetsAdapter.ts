import { createEntityAdapter } from '@reduxjs/toolkit'

import { FungibleToken, NFT } from '@/types/assets'

export const fungibleTokensAdapter = createEntityAdapter<FungibleToken>({
  sortComparer: (a, b) => a.name.localeCompare(b.name)
})

export const nftsAdapter = createEntityAdapter<NFT>({
  sortComparer: (a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : a.id.localeCompare(b.id))
})
