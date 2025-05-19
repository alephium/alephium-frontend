import { TokenId } from '@alephium/shared'

import { PersistentArrayStorage } from '@/storage/persistentArrayStorage'

export const hiddenTokensStorage = new PersistentArrayStorage<TokenId>('hiddenTokens')
