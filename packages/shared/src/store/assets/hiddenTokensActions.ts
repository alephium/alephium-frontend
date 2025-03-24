import { createAction } from '@reduxjs/toolkit'

import { TokenId } from '@/types/assets'

export const hideToken = createAction<TokenId>('hiddenTokens/hide')
export const unhideToken = createAction<TokenId>('hiddenTokens/unhide')
export const hiddenTokensLoadedFromStorage = createAction<TokenId[]>('hiddenTokens/hiddenTokensLoadedFromStorage')
