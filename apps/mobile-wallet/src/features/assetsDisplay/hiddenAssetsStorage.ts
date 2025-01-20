import { Token } from '@alephium/web3'

import { sendAnalytics } from '~/analytics'
import { getWithReportableError, storeWithReportableError } from '~/persistent-storage/utils'

const HIDDEN_ASSETS_KEY = 'alephium_favorite_dapps'

export const getHiddenAssetsIds = async (): Promise<Token['id'][]> => {
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

export const storeHiddenAssetsIds = (hiddenAssetsIds: Token['id'][]) =>
  storeWithReportableError(HIDDEN_ASSETS_KEY, JSON.stringify(hiddenAssetsIds))
