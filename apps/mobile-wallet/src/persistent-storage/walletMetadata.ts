import { addressMetadataIncludesHash, DeprecatedWalletMetadataMobile, WalletMetadataMobile } from '@alephium/shared'

import { sendAnalytics } from '~/analytics'
import i18n from '~/features/localization/i18n'
import { storage } from '~/persistent-storage/storage'
import { storeWithReportableError } from '~/persistent-storage/utils'

const walletMetadataKey = (walletId: string) => `wallet-metadata-${walletId}`

export const getWalletMetadata = (
  walletId: string,
  throwError = true
): WalletMetadataMobile | DeprecatedWalletMetadataMobile | null => {
  let rawWalletMetadata
  let walletMetadata = null

  try {
    rawWalletMetadata = storage.getString(walletMetadataKey(walletId))
  } catch (error) {
    if (throwError) throw error
  }

  if (rawWalletMetadata) {
    try {
      walletMetadata = JSON.parse(rawWalletMetadata)
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Could not parse wallet metadata' })
      if (throwError) throw error
    }
  }

  return walletMetadata
}

export const getStoredWalletMetadata = (
  walletId: string,
  error?: string
): WalletMetadataMobile | DeprecatedWalletMetadataMobile => {
  const walletMetadata = getWalletMetadata(walletId)

  if (!walletMetadata)
    throw new Error(error || `${i18n.t('Could not get stored wallet')}: ${i18n.t('Wallet metadata not found')}`)

  return walletMetadata
}

export const isStoredWalletMetadataMigrated = (
  metadata: WalletMetadataMobile | DeprecatedWalletMetadataMobile
): metadata is WalletMetadataMobile => (metadata as WalletMetadataMobile).addresses.every(addressMetadataIncludesHash)

export const storeWalletMetadata = (
  walletId: string,
  metadata: WalletMetadataMobile | DeprecatedWalletMetadataMobile
) => storeWithReportableError(walletMetadataKey(walletId), JSON.stringify(metadata))
