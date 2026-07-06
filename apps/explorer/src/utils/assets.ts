import { ALPH } from '@alephium/token-list'

import { VerifiedFungibleTokenMetadata } from '@/types/assets'

export const alphMetadata = {
  ...ALPH,
  type: 'fungible',
  verified: true
} as VerifiedFungibleTokenMetadata
