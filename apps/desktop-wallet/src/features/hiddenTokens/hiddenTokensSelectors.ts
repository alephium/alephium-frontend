import { createSelector } from '@reduxjs/toolkit'

import { RootState } from '@/storage/store'
import { TokenId } from '@/types/tokens'

export const selectIsTokenHidden = createSelector(
  (state: RootState) => state.hiddenTokens.hiddenTokensIds,
  (_state: RootState, tokenId: TokenId) => tokenId,
  (hiddenTokenIds, tokenId) => hiddenTokenIds.includes(tokenId)
)
