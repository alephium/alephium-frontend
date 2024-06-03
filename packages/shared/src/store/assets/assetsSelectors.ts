/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

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

export const {
  selectAll: selectAllNFTs,
  selectById: selectNFTById,
  selectIds: selectNFTIds
} = nftsAdapter.getSelectors<SharedRootState>((state) => state.nfts)
