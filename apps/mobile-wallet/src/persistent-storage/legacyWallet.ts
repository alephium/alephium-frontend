import { keyring, mnemonicJsonStringifiedObjectToUint8Array } from '@alephium/keyring'
import {
  AddressStoredMetadataWithHash,
  DeprecatedWalletMetadataMobile,
  GROUPLESS_ADDRESS_KEY_TYPE,
  resetArray,
  WalletMetadataMobile
} from '@alephium/shared'
import * as SecureStore from 'expo-secure-store'

import { sendAnalytics } from '~/analytics'
import i18n from '~/features/localization/i18n'
import { loadBiometricsSettings } from '~/features/settings/settingsPersistentStorage'
import { storeAddressPrivateKey, storeAddressPublicKey } from '~/persistent-storage/addressKeys'
import { defaultBiometricsConfig } from '~/persistent-storage/config'
import { storage } from '~/persistent-storage/storage'
import {
  deleteSecurelyWithReportableError,
  getSecurelyWithReportableError,
  storeSecurelyWithReportableError,
  storeWithReportableError
} from '~/persistent-storage/utils'
import { DeprecatedWalletState } from '~/types/wallet'
import { getRandomLabelColor } from '~/utils/colors'

// Legacy storage keys (used by deprecated migration code and multi-wallet migration)

export const PIN_WALLET_STORAGE_KEY = 'wallet-pin'
const BIOMETRICS_WALLET_STORAGE_KEY = 'wallet-biometrics'
export const LEGACY_WALLET_METADATA_KEY = 'wallet-metadata'
export const LEGACY_IS_NEW_WALLET_KEY = 'is-new-wallet'
export const LEGACY_MNEMONIC_KEY = 'wallet-mnemonic-v2'

// Legacy/deprecated functions (use old storage keys directly)
// These are needed for:
// 1. Deprecated PIN/biometrics migration flow
// 2. Multi-wallet migration (reads old keys, writes new keys)
// 3. validateAndRepareStoredWalletData (pre-migration fallback)

export const legacyGetWalletMetadata = async (
  throwError = true
): Promise<WalletMetadataMobile | DeprecatedWalletMetadataMobile | null> => {
  let rawWalletMetadata
  let walletMetadata = null

  try {
    rawWalletMetadata = storage.getString(LEGACY_WALLET_METADATA_KEY)
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

export const legacyGetStoredWalletMetadata = async (
  error?: string
): Promise<WalletMetadataMobile | DeprecatedWalletMetadataMobile> => {
  const walletMetadata = await legacyGetWalletMetadata()

  if (!walletMetadata)
    throw new Error(error || `${i18n.t('Could not get stored wallet')}: ${i18n.t('Wallet metadata not found')}`)

  return walletMetadata
}

export const legacyStoreWalletMetadata = (metadata: WalletMetadataMobile | DeprecatedWalletMetadataMobile) =>
  storeWithReportableError(LEGACY_WALLET_METADATA_KEY, JSON.stringify(metadata))

export const legacyStoredMnemonicV2Exists = async (): Promise<boolean> =>
  !!(await getSecurelyWithReportableError(LEGACY_MNEMONIC_KEY, true, ''))

export const legacyMigrateAddressMetadata = async () => {
  try {
    if (!keyring.isInitialized()) await legacyInitializeKeyringWithStoredWallet()

    const { addresses } = await legacyGetStoredWalletMetadata(
      `${i18n.t('Could not migrate address metadata')}: ${i18n.t('Wallet metadata not found')}`
    )
    const updatedAddressesMetadata: AddressStoredMetadataWithHash[] = []

    for (const address of addresses) {
      const { hash, publicKey } = keyring.generateAndCacheAddress({
        addressIndex: address.index,
        keyType: address.keyType ?? 'default'
      })
      let privateKey = keyring.exportPrivateKeyOfAddress(hash)

      await storeAddressPublicKey(hash, publicKey)
      await storeAddressPrivateKey(hash, privateKey)

      privateKey = ''

      updatedAddressesMetadata.push({
        ...address,
        hash
      })
    }

    const metadata = await legacyGetStoredWalletMetadata()
    legacyStoreWalletMetadata({ ...metadata, addresses: updatedAddressesMetadata })
  } finally {
    keyring.clear()
  }
}

export const legacyGenerateAndStoreWalletMetadata = async (name: string, isMnemonicBackedUp: boolean) => {
  try {
    if (!keyring.isInitialized()) await legacyInitializeKeyringWithStoredWallet()

    const nonSensitiveAddressData = keyring.generateAndCacheAddress({
      addressIndex: 0,
      keyType: GROUPLESS_ADDRESS_KEY_TYPE
    })
    let privateKey = keyring.exportPrivateKeyOfAddress(nonSensitiveAddressData.hash)

    await storeAddressPublicKey(nonSensitiveAddressData.hash, nonSensitiveAddressData.publicKey)
    await storeAddressPrivateKey(nonSensitiveAddressData.hash, privateKey)

    privateKey = ''

    const metadata: WalletMetadataMobile = {
      id: '',
      name,
      isMnemonicBackedUp,
      addresses: [
        {
          index: 0,
          keyType: GROUPLESS_ADDRESS_KEY_TYPE,
          hash: nonSensitiveAddressData.hash,
          isDefault: true,
          color: getRandomLabelColor()
        } as AddressStoredMetadataWithHash
      ],
      contacts: []
    }

    legacyStoreWalletMetadata(metadata)
  } finally {
    keyring.clear()
  }
}

export interface GetDeprecatedStoredWalletProps {
  forcePinUsage?: boolean
  authenticationPrompt?: SecureStore.SecureStoreOptions['authenticationPrompt']
}

export const getDeprecatedStoredWallet = async (
  props?: GetDeprecatedStoredWalletProps
): Promise<DeprecatedWalletState | null> => {
  const metadata = await legacyGetWalletMetadata()

  if (!metadata) {
    return null
  }

  const { id, name, isMnemonicBackedUp } = metadata
  const { biometricsRequiredForAppAccess } = await loadBiometricsSettings()

  let mnemonic: string | null = null

  if (!props?.forcePinUsage && biometricsRequiredForAppAccess) {
    mnemonic = await SecureStore.getItemAsync(
      BIOMETRICS_WALLET_STORAGE_KEY,
      props?.authenticationPrompt
        ? {
            ...defaultBiometricsConfig,
            authenticationPrompt: props.authenticationPrompt
          }
        : defaultBiometricsConfig
    )
  }

  if (!mnemonic) {
    mnemonic = await getSecurelyWithReportableError(PIN_WALLET_STORAGE_KEY, true, '')
  }

  return mnemonic
    ? ({
        id,
        name,
        mnemonic,
        isMnemonicBackedUp
      } as DeprecatedWalletState)
    : null
}

export const deleteDeprecatedWallet = async () => {
  await deleteSecurelyWithReportableError(PIN_WALLET_STORAGE_KEY, true, '')

  try {
    await SecureStore.deleteItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, defaultBiometricsConfig)
  } catch (error) {
    sendAnalytics({ type: 'error', message: `Could not delete ${BIOMETRICS_WALLET_STORAGE_KEY} from secure storage` })
    throw error
  }
}

export const migrateDeprecatedMnemonic = async (deprecatedMnemonic: string) => {
  const mnemonicUint8Array = keyring.importMnemonicString(deprecatedMnemonic)

  try {
    // Store mnemonic at legacy V2 key (multi-wallet migration will move it later)
    await storeSecurelyWithReportableError(LEGACY_MNEMONIC_KEY, JSON.stringify(mnemonicUint8Array), true, '')

    await deleteDeprecatedWallet()
    await legacyMigrateAddressMetadata()
  } finally {
    keyring.clear()
  }
}

const legacyInitializeKeyringWithStoredWallet = async () => {
  let decryptedMnemonic = await getSecurelyWithReportableError(LEGACY_MNEMONIC_KEY, true, '')
  if (!decryptedMnemonic)
    throw new Error(`${i18n.t('Could not initialize keyring')}: ${i18n.t('Could not find stored wallet')}`)

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))
  keyring.initFromDecryptedMnemonic(parsedDecryptedMnemonic, '')

  decryptedMnemonic = ''
  resetArray(parsedDecryptedMnemonic)
}
