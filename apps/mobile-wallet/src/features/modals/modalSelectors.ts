import { NFT } from '@alephium/shared'
import { createSelector } from '@reduxjs/toolkit'

import { modalAdapter } from '~/features/modals/modalAdapters'
import { RootState } from '~/store/store'

export const { selectAll: selectAllModals, selectById: selectModalById } = modalAdapter.getSelectors<RootState>(
  (state) => state.modals
)

export const selectHasNftModalOpened = createSelector(
  [(state: RootState) => state.modals, (_, nftId: NFT['id']) => nftId],
  (modals, nftId) =>
    Object.values(modals.entities).some(
      (modal) => modal?.params.name === 'NftModal' && modal.params.props.nftId === nftId
    )
)
