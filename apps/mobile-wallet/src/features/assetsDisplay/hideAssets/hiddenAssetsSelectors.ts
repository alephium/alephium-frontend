import { AddressHash } from '@alephium/shared'
import { createSelector } from '@reduxjs/toolkit'

import { selectAddressByHash } from '~/store/addressesSlice'
import { RootState } from '~/store/store'

export const selectHiddenAssetsIds = (state: RootState) => state.hiddenAssets.hiddenAssetsIds

export const selectAddressHiddenAssetIds = createSelector(
  [selectHiddenAssetsIds, (_, addressHash: AddressHash) => addressHash, (state: RootState) => state],
  (hiddenAssetsIds, addressHash, state) => {
    const address = selectAddressByHash(state, addressHash)

    return hiddenAssetsIds.filter((id) => address?.tokens.some(({ tokenId }) => tokenId === id))
  }
)
