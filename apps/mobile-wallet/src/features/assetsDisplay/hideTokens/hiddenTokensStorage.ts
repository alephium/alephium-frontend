import { Token } from '@alephium/web3'

import { sendAnalytics } from '~/analytics'
import { storage } from '~/persistent-storage/storage'
import { storeWithReportableError } from '~/persistent-storage/utils'

const hiddenTokensKey = (walletId: string) => `hidden-tokens-${walletId}`

// Legacy key used only by multi-wallet migration
export const LEGACY_HIDDEN_TOKENS_KEY = 'alephium_hidden_assets_ids'

export const getHiddenTokensIds = (walletId: string): Array<Token['id']> => {
  let hiddenTokensIds = null

  try {
    const rawHiddenTokensIds = storage.getString(hiddenTokensKey(walletId))
    hiddenTokensIds = rawHiddenTokensIds ? JSON.parse(rawHiddenTokensIds) : []
  } catch (error) {
    console.log('error', error)
    sendAnalytics({ type: 'error', error, message: 'Could not parse hidden tokens' })
  }

  return hiddenTokensIds
}

export const storeHiddenTokensIds = (walletId: string, hiddenTokensIds: Token['id'][]) =>
  storeWithReportableError(hiddenTokensKey(walletId), JSON.stringify(hiddenTokensIds))
