import { ALPH } from '@alephium/token-list'

import { AssetBase, AssetType, VerifiedFungibleTokenMetadata } from '@/types/assets'

type AssetTypeMapValues = 'fungibleTokenIds' | 'NFTIds' | 'unknownAssetIds'

const assetTypeMap: Record<NonNullable<AssetType> | 'unknown', AssetTypeMapValues> = {
  fungible: 'fungibleTokenIds',
  'non-fungible': 'NFTIds',
  unknown: 'unknownAssetIds'
}

type AssetIdCategories = Record<AssetTypeMapValues, string[]>

export const getCategorizedAssetIds = (assets: AssetBase[] = []): AssetIdCategories => {
  const grouped = Object.groupBy(assets, (asset) => assetTypeMap[asset.type || 'unknown'])
  const categorizedAssets = Object.fromEntries(Object.entries(grouped).map(([k, v]) => [k, (v ?? []).map((a) => a.id)]))

  return {
    fungibleTokenIds: categorizedAssets.fungibleTokenIds || [],
    NFTIds: categorizedAssets.NFTIds || [],
    unknownAssetIds: categorizedAssets.unknownAssetIds || []
  }
}

export const alphMetadata = {
  ...ALPH,
  type: 'fungible',
  verified: true
} as VerifiedFungibleTokenMetadata
