import { WalletMetadataMobile } from '@alephium/shared'

import { sendAnalytics } from '~/analytics'
import { LEGACY_HIDDEN_TOKENS_KEY } from '~/features/assetsDisplay/hideTokens/hiddenTokensStorage'
import { LEGACY_AUTHORIZED_CONNECTIONS_KEY } from '~/features/ecosystem/authorizedConnections/persistedAuthorizedConnectionsStorage'
import { LEGACY_FUND_PASSWORD_KEY } from '~/features/fund-password/fundPasswordStorage'
import {
  LEGACY_IS_NEW_WALLET_KEY,
  LEGACY_MNEMONIC_KEY,
  LEGACY_WALLET_METADATA_KEY
} from '~/persistent-storage/legacyWallet'
import { storage } from '~/persistent-storage/storage'
import {
  deleteSecurelyWithReportableError,
  getSecurelyWithReportableError,
  storeSecurelyWithReportableError,
  storeWithReportableError
} from '~/persistent-storage/utils'
import { createWalletListEntry, storeWalletList } from '~/persistent-storage/walletList'
import { walletMnemonicKey } from '~/persistent-storage/walletMnemonic'

const MIGRATION_VERSION_KEY = 'multi-wallet-migration-version'
const CURRENT_MIGRATION_VERSION = 1

export const runMultiWalletMigrationIfNeeded = async (): Promise<void> => {
  const currentVersion = storage.getNumber(MIGRATION_VERSION_KEY) ?? 0

  if (currentVersion >= CURRENT_MIGRATION_VERSION) return

  console.log('Running multi-wallet migration...')

  // Step 1: Read existing metadata from MMKV
  const rawMetadata = storage.getString(LEGACY_WALLET_METADATA_KEY)

  if (!rawMetadata) {
    // No metadata = fresh install or deprecated-only (handled by PIN migration flow)
    // Check if there's a V2 mnemonic without metadata (edge case)
    let mnemonicExists = false

    try {
      mnemonicExists = !!(await getSecurelyWithReportableError(LEGACY_MNEMONIC_KEY, true, ''))
    } catch {
      mnemonicExists = false
    }

    if (!mnemonicExists) {
      // Truly fresh install, just set version flag
      storage.set(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION)
      console.log('Multi-wallet migration skipped (fresh install)')

      return
    }

    // Mnemonic exists but no metadata - don't migrate yet, let validateAndRepareStoredWalletData handle it
    console.log('Multi-wallet migration deferred (mnemonic exists but no metadata)')

    return
  }

  let metadata: WalletMetadataMobile

  try {
    metadata = JSON.parse(rawMetadata)
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: 'Multi-wallet migration: could not parse metadata' })

    return
  }

  const walletId = metadata.id

  if (!walletId) {
    sendAnalytics({ type: 'error', message: 'Multi-wallet migration: metadata has no id' })

    return
  }

  // Step 2: Read V2 mnemonic from SecureStore
  let mnemonic: string | null = null

  try {
    mnemonic = await getSecurelyWithReportableError(LEGACY_MNEMONIC_KEY, true, '')
  } catch {
    // No V2 mnemonic - might be deprecated-only, skip
    console.log('Multi-wallet migration deferred (no V2 mnemonic)')

    return
  }

  if (!mnemonic) {
    console.log('Multi-wallet migration deferred (no V2 mnemonic)')

    return
  }

  try {
    // Step 3: Write wallet-metadata-{id} to MMKV
    const migratedMetadata: WalletMetadataMobile = { ...metadata, type: 'seed' }
    storeWithReportableError(`wallet-metadata-${walletId}`, JSON.stringify(migratedMetadata))

    // Step 4: Write wallet-mnemonic-{id} to SecureStore
    await storeSecurelyWithReportableError(walletMnemonicKey(walletId), mnemonic, true, '')

    // Step 5: VERIFY - Read back and compare
    const verifiedMnemonic = await getSecurelyWithReportableError(walletMnemonicKey(walletId), true, '')

    if (verifiedMnemonic !== mnemonic) {
      sendAnalytics({ type: 'error', message: 'Multi-wallet migration: mnemonic verification failed' })

      // Clean up the new key since verification failed
      try {
        await deleteSecurelyWithReportableError(walletMnemonicKey(walletId), true, '')
      } catch {
        // Best effort cleanup
      }

      storage.delete(`wallet-metadata-${walletId}`)

      return
    }

    // Step 6: Write wallet list
    storeWalletList([createWalletListEntry(walletId, metadata.name, 'seed')])

    // Step 7: Migrate fund password (if exists)
    let fundPasswordMigrated = true

    try {
      const fundPassword = await getSecurelyWithReportableError(LEGACY_FUND_PASSWORD_KEY, true, '')

      if (fundPassword) {
        await storeSecurelyWithReportableError(`fund-password-${walletId}`, fundPassword, true, '')

        // Verify fund password was written correctly
        const verifiedFundPassword = await getSecurelyWithReportableError(`fund-password-${walletId}`, true, '')

        if (verifiedFundPassword !== fundPassword) {
          sendAnalytics({ type: 'error', message: 'Multi-wallet migration: fund password verification failed' })
          fundPasswordMigrated = false
        }
      }
    } catch {
      sendAnalytics({ type: 'error', message: 'Multi-wallet migration: fund password migration failed' })
      fundPasswordMigrated = false
    }

    // Step 8: Migrate hidden tokens (if exists)
    const rawHiddenTokens = storage.getString(LEGACY_HIDDEN_TOKENS_KEY)

    if (rawHiddenTokens) {
      storeWithReportableError(`hidden-tokens-${walletId}`, rawHiddenTokens)
    }

    // Step 9: Migrate is-new-wallet flag (if exists)
    const isNewWallet = storage.getBoolean(LEGACY_IS_NEW_WALLET_KEY)

    if (isNewWallet !== undefined) {
      storeWithReportableError(`is-new-wallet-${walletId}`, isNewWallet)
    }

    // Step 10: Migrate authorized connections (if exists)
    const rawConnections = storage.getString(LEGACY_AUTHORIZED_CONNECTIONS_KEY)

    if (rawConnections) {
      storeWithReportableError(`authorized-connections-${walletId}`, rawConnections)
    }

    // Step 11: Set migration version BEFORE deleting old keys
    storage.set(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION)

    // Step 12: Delete old keys (only after everything is written and verified)
    storage.delete(LEGACY_WALLET_METADATA_KEY)
    storage.delete(LEGACY_HIDDEN_TOKENS_KEY)
    storage.delete(LEGACY_IS_NEW_WALLET_KEY)
    storage.delete(LEGACY_AUTHORIZED_CONNECTIONS_KEY)

    try {
      await deleteSecurelyWithReportableError(LEGACY_MNEMONIC_KEY, true, '')
    } catch {
      // Non-critical - orphaned old key is harmless
    }

    if (fundPasswordMigrated) {
      try {
        await deleteSecurelyWithReportableError(LEGACY_FUND_PASSWORD_KEY, true, '')
      } catch {
        // Non-critical - orphaned old key is harmless
      }
    }

    console.log(`Multi-wallet migration completed for wallet ${walletId}`)
    sendAnalytics({ event: 'Multi-wallet migration completed' })
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: 'Multi-wallet migration failed' })
    // Old keys remain intact, migration will retry on next launch
  }
}
