/*
Copyright 2018 - 2023 The Alephium Authors
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

// TODO: Same as in desktop wallet

import { createSelector } from '@reduxjs/toolkit'

import { networkPresetSettings } from '@/persistent-storage/settings'
import { assetsInfoAdapter, nftsAdapter } from '@/store/assets/assetsAdapter'
import { RootState } from '@/store/store'

export const { selectAll: selectAllAssetsInfo, selectById: selectAssetInfoById } =
  assetsInfoAdapter.getSelectors<RootState>((state) => state.assetsInfo)

export const selectIsTokensMetadataUninitialized = createSelector(
  [(state: RootState) => state.assetsInfo.status, (state: RootState) => state.network.settings.networkId],
  (status, networkId) =>
    (networkId === networkPresetSettings.mainnet.networkId || networkId === networkPresetSettings.testnet.networkId) &&
    status === 'uninitialized'
)

export const {
  selectAll: selectAllNFTs,
  selectById: selectNFTById,
  selectIds: selectNFTIds
} = nftsAdapter.getSelectors<RootState>((state) => state.nfts)
