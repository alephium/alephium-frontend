import { Token } from '@alephium/web3'
import { createAction } from '@reduxjs/toolkit'

export const hideAsset = createAction<Token['id']>('hiddenAssets/hide')
export const unhideAsset = createAction<Token['id']>('hiddenAssets/unhide')
export const loadHiddenAssets = createAction<Token['id'][]>('hiddenAssets/loadHiddenAssets')
export const hiddenAssetsLoadedFromStorage = createAction<Token['id'][]>('hiddenAssets/hiddenAssetsLoadedFromStorage')
