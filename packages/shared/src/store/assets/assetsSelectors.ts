import { createSelector } from '@reduxjs/toolkit'

import { networkSettingsPresets } from '@/network'
import { fungibleTokensAdapter, nftsAdapter } from '@/store/assets/assetsAdapter'
import { SharedRootState } from '@/store/store'

export const { selectAll: selectAllFungibleTokens, selectById: selectFungibleTokenById } =
  fungibleTokensAdapter.getSelectors<SharedRootState>((state) => state.fungibleTokens)

export const selectDoVerifiedFungibleTokensNeedInitialization = createSelector(
  [
    (state: SharedRootState) => state.fungibleTokens.status,
    (state: SharedRootState) => state.network.settings.networkId
  ],
  (status, networkId) =>
    (networkId === networkSettingsPresets.mainnet.networkId ||
      networkId === networkSettingsPresets.testnet.networkId ||
      networkId === networkSettingsPresets.devnet.networkId) &&
    status === 'uninitialized'
)

export const { selectAll: selectAllNFTs } = nftsAdapter.getSelectors<SharedRootState>((state) => state.nfts)
