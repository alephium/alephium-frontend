import { TokenId } from '@alephium/shared/types'

import { PersistentArrayStorage } from '@/storage/persistentArrayStorage'

export const hiddenTokensStorage = new PersistentArrayStorage<TokenId>('hiddenTokens')
