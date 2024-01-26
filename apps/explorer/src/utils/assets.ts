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

import { ALPH } from '@alephium/token-list'
import { groupBy, map, mapValues } from 'lodash'

import { AssetBase, AssetType, VerifiedFungibleTokenMetadata } from '@/types/assets'

type AssetTypeMapValues = 'fungibleTokenIds' | 'NFTIds' | 'unknownAssetIds'

const assetTypeMap: Record<NonNullable<AssetType> | 'unknown', AssetTypeMapValues> = {
  fungible: 'fungibleTokenIds',
  'non-fungible': 'NFTIds',
  unknown: 'unknownAssetIds'
}

type AssetIdCategories = Record<AssetTypeMapValues, string[]>

export const getCategorizedAssetIds = (assets: AssetBase[] = []): AssetIdCategories => {
  const categorizedAssets = mapValues(
    groupBy(assets, (asset) => assetTypeMap[asset.type || 'unknown']),
    (assetsGroup) => map(assetsGroup, 'id')
  )

  return {
    fungibleTokenIds: categorizedAssets.fungibleTokenIds || [],
    NFTIds: categorizedAssets.NFTIds || [],
    unknownAssetIds: categorizedAssets.unknownAssetIds || []
  }
}

export const alphMetadata = { ...ALPH, type: 'fungible', verified: true } as VerifiedFungibleTokenMetadata
