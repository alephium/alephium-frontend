import { createSelector } from '@reduxjs/toolkit'

import { SharedRootState } from '@/store/store'
import { TokenId } from '@/types/assets'

export const selectIsTokenHidden = createSelector(
  (state: SharedRootState) => state.hiddenTokens.hiddenTokensIds,
  (_state: SharedRootState, tokenId: TokenId) => tokenId,
  (hiddenTokenIds, tokenId) => hiddenTokenIds.includes(tokenId)
)
