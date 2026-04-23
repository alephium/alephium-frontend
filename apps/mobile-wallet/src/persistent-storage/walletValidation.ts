import { GROUPLESS_ADDRESS_KEY_TYPE } from '@alephium/shared'
import { nanoid } from 'nanoid'

import { wasAppUninstalled } from '~/persistent-storage/app'
import {
  LEGACY_WALLET_METADATA_KEY,
  legacyGenerateAndStoreWalletMetadata,
  legacyGetWalletMetadata,
  legacyMigrateAddressMetadata,
  legacyStoredMnemonicV2Exists,
  legacyStoreWalletMetadata,
  PIN_WALLET_STORAGE_KEY
} from '~/persistent-storage/legacyWallet'
import { storage } from '~/persistent-storage/storage'
import { getSecurelyWithReportableError } from '~/persistent-storage/utils'
import { getWalletMetadata, isStoredWalletMetadataMigrated } from '~/persistent-storage/wallet'
import { getLastUsedWallet, walletListExists } from '~/persistent-storage/walletList'
import { getRandomLabelColor } from '~/utils/colors'

export type WalletValidationResult =
  | { status: 'valid'; warning?: string }
  | { status: 'invalid'; error: string }
  | {
      status: 'needs-restore'
      appWasUninstalled: boolean
      restoreWallet: () => Promise<boolean>
    }

export const validateAndRepairStoredWalletData = async (): Promise<WalletValidationResult> => {
  // If multi-wallet migration already ran, the wallet list exists and legacy keys are deleted.
  // In that case, validate using wallet-ID-scoped keys instead.
  if (walletListExists()) {
    const lastUsed = getLastUsedWallet()

    if (lastUsed) {
      const metadata = getWalletMetadata(lastUsed.id, false)

      if (metadata) {
        if (!isStoredWalletMetadataMigrated(metadata)) {
          return { status: 'valid', warning: 'Post-migration wallet has unmigrated metadata' }
        }

        return { status: 'valid' }
      }
    }

    return { status: 'invalid', error: 'Wallet list exists but no valid wallet metadata found' }
  }

  // Legacy validation (pre-migration or deprecated mnemonic flow)
  const walletMetadata = await legacyGetWalletMetadata(false)
  let mnemonicV2Exists

  let appWasUninstalled_

  try {
    mnemonicV2Exists = await legacyStoredMnemonicV2Exists()
  } catch {
    mnemonicV2Exists = false
  }

  try {
    appWasUninstalled_ = await wasAppUninstalled()
  } catch {
    appWasUninstalled_ = false
  }

  if (mnemonicV2Exists) {
    if (walletMetadata) {
      if (!isStoredWalletMetadataMigrated(walletMetadata)) {
        await legacyMigrateAddressMetadata()
      }

      return { status: 'valid' }
    } else {
      return {
        status: 'needs-restore',
        appWasUninstalled: !!appWasUninstalled_,
        restoreWallet: async () => {
          try {
            await legacyGenerateAndStoreWalletMetadata('My wallet', false)
          } catch (error) {
            if (__DEV__) console.error(error)
          }

          const restoredMetadata = await legacyGetWalletMetadata(false)

          return !!restoredMetadata
        }
      }
    }
  } else {
    let deprecatedWalletExists

    try {
      deprecatedWalletExists = !!(await getSecurelyWithReportableError(PIN_WALLET_STORAGE_KEY, true, ''))
    } catch {
      deprecatedWalletExists = false
    }

    if (deprecatedWalletExists) {
      if (walletMetadata) {
        return { status: 'valid' }
      } else {
        try {
          legacyStoreWalletMetadata({
            id: nanoid(),
            name: 'My wallet',
            isMnemonicBackedUp: false,
            addresses: [
              {
                index: 0,
                keyType: GROUPLESS_ADDRESS_KEY_TYPE,
                isDefault: true,
                color: getRandomLabelColor()
              }
            ],
            contacts: []
          })

          return { status: 'valid' }
        } catch {
          return { status: 'invalid', error: 'Could not recreate deprecated wallet metadata' }
        }
      }
    } else {
      if (!walletMetadata) {
        return { status: 'valid' }
      } else {
        try {
          storage.delete(LEGACY_WALLET_METADATA_KEY)
        } catch {
          // Best effort deletion
        }

        const remainingMetadata = await legacyGetWalletMetadata(false)

        return remainingMetadata
          ? { status: 'invalid', error: 'Could not find mnemonic for existing wallet metadata' }
          : { status: 'valid' }
      }
    }
  }
}
