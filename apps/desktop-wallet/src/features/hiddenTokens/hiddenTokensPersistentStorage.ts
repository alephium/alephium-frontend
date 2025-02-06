import { PersistentArrayStorage } from '@/storage/persistentArrayStorage'
import { TokenId } from '@/types/tokens'

export const hiddenTokensStorage = new PersistentArrayStorage<TokenId>('hiddenTokens')
