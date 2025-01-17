import { FungibleToken, NFT } from '@alephium/shared'

import { sendAnalytics } from '~/analytics'
import { getWithReportableError, storeWithReportableError } from '~/persistent-storage/utils'

const HIDDEN_ASSETS_KEY = 'alephium_favorite_dapps'

export const getHiddenAssetsIds = async (): Promise<(FungibleToken['id'] | NFT['id'])[]> => {
  let hiddenAssetsIds = null

  try {
    const rawHiddenAssetIds = await getWithReportableError(HIDDEN_ASSETS_KEY)
    hiddenAssetsIds = rawHiddenAssetIds ? JSON.parse(rawHiddenAssetIds) : []
  } catch (error) {
    console.log('error', error)
    sendAnalytics({ type: 'error', error, message: 'Could not parse hidden assets' })
  }

  return hiddenAssetsIds
}

export const storeHiddenAssetsIds = (hiddenAssetsIds: (FungibleToken['id'] | NFT['id'])[]) =>
  storeWithReportableError(HIDDEN_ASSETS_KEY, JSON.stringify(hiddenAssetsIds))
