import { FungibleToken, NFT } from '@alephium/shared'
import { createAction } from '@reduxjs/toolkit'

export const hideAsset = createAction<FungibleToken['id'] | NFT['id']>('hiddenAssets/hide')
export const unhideAsset = createAction<FungibleToken['id'] | NFT['id']>('hiddenAssets/unhide')
export const loadHiddenAssets = createAction<(FungibleToken['id'] | NFT['id'])[]>('hiddenAssets/loadHiddenAssets')
export const hiddenAssetsLoadedFromStorage = createAction<(FungibleToken['id'] | NFT['id'])[]>(
  'hiddenAssets/hiddenAssetsLoadedFromStorage'
)
