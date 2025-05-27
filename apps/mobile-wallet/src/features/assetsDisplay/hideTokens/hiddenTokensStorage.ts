import { Token } from '@alephium/web3'

import { sendAnalytics } from '~/analytics'
import { storage } from '~/persistent-storage/storage'
import { storeWithReportableError } from '~/persistent-storage/utils'

const HIDDEN_TOKENS_KEY = 'alephium_hidden_assets_ids'

export const getHiddenTokensIds = (): Array<Token['id']> => {
  let hiddenTokensIds = null

  try {
    const rawHiddenTokensIds = storage.getString(HIDDEN_TOKENS_KEY)
    hiddenTokensIds = rawHiddenTokensIds ? JSON.parse(rawHiddenTokensIds) : []
  } catch (error) {
    console.log('error', error)
    sendAnalytics({ type: 'error', error, message: 'Could not parse hidden tokens' })
  }

  return hiddenTokensIds
}

export const storeHiddenTokensIds = (hiddenTokensIds: Token['id'][]) =>
  storeWithReportableError(HIDDEN_TOKENS_KEY, JSON.stringify(hiddenTokensIds))
