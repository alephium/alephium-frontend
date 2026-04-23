import {
  dangerouslyConvertUint8ArrayMnemonicToString,
  keyring,
  mnemonicJsonStringifiedObjectToUint8Array
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
import { nanoid } from 'nanoid'

import { sendAnalytics } from '~/analytics'
import { deleteFundPassword } from '~/features/fund-password/fundPasswordStorage'
import i18n from '~/features/localization/i18n'
import { deleteAddressKeyPair, generateAndStoreAddressKeypairForIndex } from '~/persistent-storage/addressKeys'
import { legacyGetWalletMetadata, legacyStoredMnemonicV2Exists } from '~/persistent-storage/legacyWallet'
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
import { GeneratedWallet, WalletStoredState } from '~/types/wallet'
import { getRandomLabelColor } from '~/utils/colors'

export const walletMnemonicKey = (walletId: string) => `wallet-mnemonic-${walletId}`
const walletMetadataKey = (walletId: string) => `wallet-metadata-${walletId}`
const isNewWalletKey = (walletId: string) => `is-new-wallet-${walletId}`

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

export const updateStoredWalletMetadata = (walletId: string, partialMetadata: Partial<WalletMetadataMobile>) => {
  const walletMetadata = getStoredWalletMetadata(
    walletId,
    i18n.t('Could not persist wallet metadata: No entry found in storage')
  )
  const updatedWalletMetadata = { ...walletMetadata, ...partialMetadata }

  storeWalletMetadata(walletId, updatedWalletMetadata)
}

export const deleteWallet = async (walletId: string) => {
  const wallet = getStoredWalletMetadata(walletId)

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
  const wallet = getStoredWalletMetadata(walletId)

  const addressIndex = wallet.addresses.findIndex(
    (address) => addressMetadataIncludesHash(address) && address.hash === addressHash
  )

  if (addressIndex >= 0) {
    wallet.addresses.splice(addressIndex, 1)
    await deleteAddressKeyPair(addressHash)
  }

  storeWalletMetadata(walletId, wallet)
}

export const persistAddressesMetadata = (walletId: string, addressesMetadata: AddressStoredMetadataWithHash[]) => {
  const walletMetadata = getStoredWalletMetadata(
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
