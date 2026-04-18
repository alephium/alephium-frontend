import {
  dangerouslyConvertUint8ArrayMnemonicToString,
  keyring,
  mnemonicJsonStringifiedObjectToUint8Array,
  NonSensitiveAddressData
} from '@alephium/keyring'
import {
  AddressHash,
  addressMetadataIncludesHash,
  AddressStoredMetadataWithHash,
  DeprecatedWalletMetadataMobile,
  GROUPLESS_ADDRESS_KEY_TYPE,
  resetArray,
  WalletMetadataMobile
} from '@alephium/shared'
import { KeyType } from '@alephium/web3'
import * as SecureStore from 'expo-secure-store'
import { nanoid } from 'nanoid'
import { Alert } from 'react-native'

import { sendAnalytics } from '~/analytics'
import { deleteFundPassword } from '~/features/fund-password/fundPasswordStorage'
import i18n from '~/features/localization/i18n'
import { loadBiometricsSettings } from '~/features/settings/settingsPersistentStorage'
import { wasAppUninstalled } from '~/persistent-storage/app'
import { defaultBiometricsConfig } from '~/persistent-storage/config'
import { storage } from '~/persistent-storage/storage'
import {
  deleteSecurelyWithReportableError,
  getSecurelyWithReportableError,
  storeSecurelyWithReportableError,
  storeWithReportableError
} from '~/persistent-storage/utils'
import {
  addWalletToList,
  createWalletListEntry,
  getLastUsedWallet,
  removeWalletFromList,
  walletListExists
} from '~/persistent-storage/walletList'
import { DeprecatedWalletState, GeneratedWallet, WalletStoredState } from '~/types/wallet'
import { getRandomLabelColor } from '~/utils/colors'
import { showToast } from '~/utils/layout'

// === Wallet-ID-scoped storage key functions ===

export const walletMnemonicKey = (walletId: string) => `wallet-mnemonic-${walletId}`
const walletMetadataKey = (walletId: string) => `wallet-metadata-${walletId}`
const isNewWalletKey = (walletId: string) => `is-new-wallet-${walletId}`

// === Legacy storage keys (used by deprecated migration code and multi-wallet migration) ===

const PIN_WALLET_STORAGE_KEY = 'wallet-pin'
const BIOMETRICS_WALLET_STORAGE_KEY = 'wallet-biometrics'
export const LEGACY_WALLET_METADATA_KEY = 'wallet-metadata'
export const LEGACY_IS_NEW_WALLET_KEY = 'is-new-wallet'
export const LEGACY_MNEMONIC_KEY = 'wallet-mnemonic-v2'
const ADDRESS_PUB_KEY_PREFIX = 'address-pub-key-'
const ADDRESS_PRIV_KEY_PREFIX = 'address-priv-key-'

// ==============================================
// Wallet-ID-scoped functions (multi-wallet)
// ==============================================

export const generateAndStoreWallet = async (
  name: WalletStoredState['name'],
  mnemonicToImport?: string
): Promise<GeneratedWallet> => {
  const isMnemonicBackedUp = !!mnemonicToImport
  const walletId = nanoid()

  try {
    const mnemonicUint8Array = mnemonicToImport
      ? keyring.importMnemonicString(mnemonicToImport)
      : keyring.generateRandomMnemonic()

    await storeWalletMnemonic(walletId, mnemonicUint8Array)

    const initialAddress = await generateAndStoreAddressKeypairForIndex(walletId, 0, GROUPLESS_ADDRESS_KEY_TYPE)
    const walletMetadata = generateWalletMetadata(walletId, name, initialAddress.hash, isMnemonicBackedUp)

    storeWalletMetadata(walletId, walletMetadata)
    addWalletToList(createWalletListEntry(walletId, name, 'seed'))

    return {
      id: walletId,
      name,
      isMnemonicBackedUp,
      initialAddress
    }
  } finally {
    keyring.clear()
  }
}

export const getWalletMetadata = async (
  walletId: string,
  throwError = true
): Promise<WalletMetadataMobile | DeprecatedWalletMetadataMobile | null> => {
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

export const getStoredWalletMetadata = async (
  walletId: string,
  error?: string
): Promise<WalletMetadataMobile | DeprecatedWalletMetadataMobile> => {
  const walletMetadata = await getWalletMetadata(walletId)

  if (!walletMetadata)
    throw new Error(error || `${i18n.t('Could not get stored wallet')}: ${i18n.t('Wallet metadata not found')}`)

  return walletMetadata
}

export const isStoredWalletMetadataMigrated = (
  metadata: WalletMetadataMobile | DeprecatedWalletMetadataMobile
): metadata is WalletMetadataMobile => (metadata as WalletMetadataMobile).addresses.every(addressMetadataIncludesHash)

export const updateStoredWalletMetadata = async (walletId: string, partialMetadata: Partial<WalletMetadataMobile>) => {
  const walletMetadata = await getStoredWalletMetadata(
    walletId,
    i18n.t('Could not persist wallet metadata: No entry found in storage')
  )
  const updatedWalletMetadata = { ...walletMetadata, ...partialMetadata }

  storeWalletMetadata(walletId, updatedWalletMetadata)
}

export const deleteWallet = async (walletId: string) => {
  const wallet = await getStoredWalletMetadata(walletId)

  for (const address of wallet.addresses) {
    if (addressMetadataIncludesHash(address)) {
      await deleteAddressKeyPair(address.hash)
    }
  }

  await deleteSecurelyWithReportableError(walletMnemonicKey(walletId), true, '')
  await deleteFundPassword(walletId)
  storage.delete(walletMetadataKey(walletId))
  storage.delete(isNewWalletKey(walletId))
  removeWalletFromList(walletId)
}

export const deleteAddress = async (walletId: string, addressHash: AddressHash) => {
  const wallet = await getStoredWalletMetadata(walletId)

  const addressIndex = wallet.addresses.findIndex(
    (address) => addressMetadataIncludesHash(address) && address.hash === addressHash
  )

  if (addressIndex >= 0) {
    wallet.addresses.splice(addressIndex, 1)
    await deleteAddressKeyPair(addressHash)
  }

  storeWalletMetadata(walletId, wallet)
}

export const persistAddressesMetadata = async (
  walletId: string,
  addressesMetadata: AddressStoredMetadataWithHash[]
) => {
  const walletMetadata = await getStoredWalletMetadata(
    walletId,
    `${i18n.t('Could not persist addresses metadata')}: ${i18n.t('Wallet metadata not found')}`
  )

  for (const metadata of addressesMetadata) {
    const addressIndex = walletMetadata.addresses.findIndex(
      (data) => data.index === metadata.index && (data.keyType ?? 'default') === (metadata.keyType ?? 'default')
    )

    if (addressIndex >= 0) {
      walletMetadata.addresses.splice(addressIndex, 1, metadata)
    } else {
      walletMetadata.addresses.push(metadata)
    }

    console.log(`💽 Storing address index ${metadata.index} keyType ${metadata.keyType} metadata in persistent storage`)
  }

  storeWalletMetadata(walletId, walletMetadata)
}

export const getIsNewWallet = (walletId: string): boolean | undefined => storage.getBoolean(isNewWalletKey(walletId))

export const storeIsNewWallet = (walletId: string, isNew: boolean) =>
  storeWithReportableError(isNewWalletKey(walletId), isNew)

export const storedMnemonicExists = async (walletId: string): Promise<boolean> =>
  !!(await getSecurelyWithReportableError(walletMnemonicKey(walletId), true, ''))

export const dangerouslyExportWalletMnemonic = async (walletId: string): Promise<string> => {
  const decryptedMnemonic = await getSecurelyWithReportableError(walletMnemonicKey(walletId), true, '')

  if (!decryptedMnemonic)
    throw new Error(`${i18n.t('Could not export mnemonic')}: ${i18n.t('Could not find stored wallet')}`)

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))

  return dangerouslyConvertUint8ArrayMnemonicToString(parsedDecryptedMnemonic)
}

export const getAddressAsymetricKey = async (
  walletId: string,
  addressHash: AddressHash,
  keyType: 'public' | 'private'
) => {
  const storageKey = (keyType === 'public' ? ADDRESS_PUB_KEY_PREFIX : ADDRESS_PRIV_KEY_PREFIX) + addressHash
  let key = await getSecurelyWithReportableError(storageKey, false, `Could not get ${keyType} from secure storage`)

  if (!key) {
    const { addresses } = await getStoredWalletMetadata(
      walletId,
      `${i18n.t(
        keyType === 'public' ? 'Could not get address public key' : 'Could not get address private key'
      )}: ${i18n.t('Wallet metadata not found')}`
    )
    const address = addresses.find((address) => addressMetadataIncludesHash(address) && address.hash === addressHash)

    if (!address)
      throw new Error(
        `${i18n.t(
          keyType === 'public' ? 'Could not get address public key' : 'Could not get address private key'
        )}: ${i18n.t('Address metadata not found')}`
      )

    await generateAndStoreAddressKeypairForIndex(walletId, address.index, address.keyType ?? 'default')
    key = await getSecurelyWithReportableError(storageKey, false, `Could not get ${keyType} from secure storage`)

    if (!key)
      throw new Error(
        i18n.t(
          keyType === 'public' ? 'Could not generate address public key' : 'Could not generate address private key'
        )
      )
  }

  return key
}

export const initializeKeyringWithStoredWallet = async (walletId: string) => {
  let decryptedMnemonic = await getSecurelyWithReportableError(walletMnemonicKey(walletId), true, '')
  if (!decryptedMnemonic)
    throw new Error(`${i18n.t('Could not initialize keyring')}: ${i18n.t('Could not find stored wallet')}`)

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))
  keyring.initFromDecryptedMnemonic(parsedDecryptedMnemonic, '')

  decryptedMnemonic = ''
  resetArray(parsedDecryptedMnemonic)
}

export const storeWalletMetadata = (
  walletId: string,
  metadata: WalletMetadataMobile | DeprecatedWalletMetadataMobile
) => storeWithReportableError(walletMetadataKey(walletId), JSON.stringify(metadata))

export const storeWalletMnemonic = async (walletId: string, mnemonic: Uint8Array) =>
  storeSecurelyWithReportableError(walletMnemonicKey(walletId), JSON.stringify(mnemonic), true, '')

// ==============================================
// Internal helpers
// ==============================================

const deleteAddressKeyPair = async (addressHash: AddressHash) => {
  await deleteAddressPublicKey(addressHash)
  await deleteAddressPrivateKey(addressHash)
}

const generateWalletMetadata = (
  walletId: string,
  name: string,
  initialAddressHash: string,
  isMnemonicBackedUp = false
): WalletMetadataMobile => ({
  id: walletId,
  name,
  type: 'seed',
  isMnemonicBackedUp,
  addresses: [
    {
      index: 0,
      keyType: GROUPLESS_ADDRESS_KEY_TYPE,
      hash: initialAddressHash,
      isDefault: true,
      color: getRandomLabelColor()
    } as AddressStoredMetadataWithHash
  ],
  contacts: []
})

const storeAddressPublicKey = async (addressHash: AddressHash, publicKey: string) =>
  storeSecurelyWithReportableError(
    ADDRESS_PUB_KEY_PREFIX + addressHash,
    publicKey,
    false,
    'Could not store address public key'
  )

const storeAddressPrivateKey = async (addressHash: AddressHash, privateKey: string) => {
  storeSecurelyWithReportableError(
    ADDRESS_PRIV_KEY_PREFIX + addressHash,
    privateKey,
    false,
    'Could not store address private key'
  )

  privateKey = ''
}

const deleteAddressPublicKey = async (addressHash: AddressHash) =>
  deleteSecurelyWithReportableError(ADDRESS_PUB_KEY_PREFIX + addressHash, false, 'Could not delete address public key')

const deleteAddressPrivateKey = async (addressHash: AddressHash) =>
  deleteSecurelyWithReportableError(
    ADDRESS_PRIV_KEY_PREFIX + addressHash,
    false,
    'Could not delete address private key'
  )

const generateAndStoreAddressKeypairForIndex = async (
  walletId: string,
  addressIndex: number,
  keyType: KeyType
): Promise<NonSensitiveAddressData> => {
  try {
    if (!keyring.isInitialized()) await initializeKeyringWithStoredWallet(walletId)

    const nonSensitiveAddressData = keyring.generateAndCacheAddress({ addressIndex, keyType })
    let privateKey = keyring.exportPrivateKeyOfAddress(nonSensitiveAddressData.hash)

    await storeAddressPublicKey(nonSensitiveAddressData.hash, nonSensitiveAddressData.publicKey)
    await storeAddressPrivateKey(nonSensitiveAddressData.hash, privateKey)

    privateKey = ''

    return nonSensitiveAddressData
  } finally {
    keyring.clear()
  }
}

// ==============================================
// Legacy/deprecated functions (use old storage keys directly)
// These are needed for:
// 1. Deprecated PIN/biometrics migration flow
// 2. Multi-wallet migration (reads old keys, writes new keys)
// 3. validateAndRepareStoredWalletData (pre-migration fallback)
// ==============================================

export const validateAndRepareStoredWalletData = async (
  onUserConfirm: (userChoseYes: boolean) => void
): Promise<'valid' | 'invalid' | 'awaiting-user-confirmation'> => {
  // If multi-wallet migration already ran, the wallet list exists and legacy keys are deleted.
  // In that case, validate using wallet-ID-scoped keys instead.
  if (walletListExists()) {
    const lastUsed = getLastUsedWallet()

    if (lastUsed) {
      const metadata = await getWalletMetadata(lastUsed.id, false)

      if (metadata) {
        if (!isStoredWalletMetadataMigrated(metadata)) {
          // This shouldn't happen post-migration, but handle gracefully
          sendAnalytics({ type: 'error', message: 'Post-migration wallet has unmigrated metadata' })
        }

        return 'valid'
      }
    }

    // Wallet list exists but no valid wallet found - shouldn't happen
    return 'valid'
  }

  // Legacy validation (pre-migration or deprecated mnemonic flow)
  let walletMetadata = await legacyGetWalletMetadata(false)
  let mnemonicV2Exists

  let appWasUninstalled

  try {
    mnemonicV2Exists = await legacyStoredMnemonicV2Exists()
  } catch {
    mnemonicV2Exists = false
  }

  try {
    appWasUninstalled = await wasAppUninstalled()
  } catch {
    appWasUninstalled = false
  }

  if (mnemonicV2Exists) {
    if (walletMetadata) {
      if (!isStoredWalletMetadataMigrated(walletMetadata)) {
        await legacyMigrateAddressMetadata()
      }

      // If we have both mnemonic and metadata available, then all good
      return 'valid'
    } else {
      // If we have mnemonic but missing metadata, we try to recreate them with sane defaults
      Alert.alert(
        i18n.t('Restore data'),
        i18n.t(
          appWasUninstalled
            ? 'We noticed that you deleted the app, would you like to restore your last wallet?'
            : "Due to an unexpected error some of your app's data are missing. Would you like to regenerate them? Your funds are safe."
        ),
        [
          {
            text: i18n.t('No'),
            onPress: () => onUserConfirm(false)
          },
          {
            text: i18n.t('Yes'),
            onPress: async () => {
              try {
                await legacyGenerateAndStoreWalletMetadata('My wallet', false)
              } catch (error) {
                if (__DEV__) console.error(error)
              } finally {
                walletMetadata = await legacyGetWalletMetadata(false)
              }

              if (walletMetadata) {
                showToast({
                  text1: i18n.t('App data were reset'),
                  type: 'success'
                })
                sendAnalytics({ event: 'Recreated missing wallet metadata for existing wallet' })

                onUserConfirm(true)
              } else {
                showToast({
                  text1: i18n.t('Could not unlock app'),
                  text2: i18n.t('Wallet metadata not found'),
                  type: 'error',
                  autoHide: false
                })
                sendAnalytics({
                  type: 'error',
                  message: 'Could not recreate missing wallet metadata for existing wallet'
                })
              }
            }
          }
        ]
      )

      return 'awaiting-user-confirmation'
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
        // If we have no mnemonic, but we have a deprecated one with metadata, all good, the pin/bio flow will migrate
        return 'valid'
      } else {
        // If we only have a deprecated mnemonic but no metadata we recreate deprecated metadata with sane defaults and
        // the migration flow will migrate both mnemonic and metadata
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

          return 'valid'
        } catch {
          return 'invalid'
        }
      }
    } else {
      if (!walletMetadata) {
        // If we have no mnemonic, no deprecated mnemonic, and no metadata, all good, fresh install
        return 'valid'
      } else {
        // If we have metadata but no mnemonic and no deprecated mnemonic, we should delete the metadata
        try {
          storage.delete(LEGACY_WALLET_METADATA_KEY)
        } finally {
          walletMetadata = await legacyGetWalletMetadata(false)
        }

        if (!walletMetadata) {
          return 'valid'
        } else {
          // This should never happen. Could not delete metadata and we don't have any mnemonic, we can't unlock
          showToast({
            text1: i18n.t('Could not unlock app'),
            text2: i18n.t('Missing encrypted mnemonic'),
            type: 'error',
            autoHide: false
          })
          sendAnalytics({ type: 'error', message: 'Could not find mnemonic for existing wallet metadata' })

          return 'invalid'
        }
      }
    }
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

export const legacyStoredMnemonicV2Exists = async (): Promise<boolean> =>
  !!(await getSecurelyWithReportableError(LEGACY_MNEMONIC_KEY, true, ''))

// Used by App.tsx to get metadata before wallet ID is known (pre-unlock).
// Checks wallet list first (post-migration), falls back to legacy key (pre-migration).
export const getStoredWalletMetadataWithoutThrowingError = async () => {
  const lastUsed = getLastUsedWallet()

  if (lastUsed) {
    return getWalletMetadata(lastUsed.id, false)
  }

  return legacyGetWalletMetadata(false)
}

// Checks wallet list first, falls back to legacy keys for backward compat.
export const storedWalletExists = async (): Promise<boolean> => {
  if (walletListExists()) return true

  const mnemonicExists = await legacyStoredMnemonicV2Exists()
  const metadataExist = !!(await legacyGetWalletMetadata())

  return mnemonicExists && metadataExist
}

// ==============================================
// Legacy helper functions (internal, use old storage keys)
// ==============================================

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

const legacyInitializeKeyringWithStoredWallet = async () => {
  let decryptedMnemonic = await getSecurelyWithReportableError(LEGACY_MNEMONIC_KEY, true, '')
  if (!decryptedMnemonic)
    throw new Error(`${i18n.t('Could not initialize keyring')}: ${i18n.t('Could not find stored wallet')}`)

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))
  keyring.initFromDecryptedMnemonic(parsedDecryptedMnemonic, '')

  decryptedMnemonic = ''
  resetArray(parsedDecryptedMnemonic)
}

const legacyMigrateAddressMetadata = async () => {
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

const legacyGenerateAndStoreWalletMetadata = async (name: WalletStoredState['name'], isMnemonicBackedUp: boolean) => {
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
      id: nanoid(),
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
