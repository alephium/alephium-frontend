import { keyring } from '@alephium/keyring'
import { GROUPLESS_ADDRESS_KEY_TYPE } from '@alephium/shared'
import { AddressHash, AddressStoredMetadataWithHash, WalletMetadataMobile } from '@alephium/shared/types'
import { addressMetadataIncludesHash } from '@alephium/shared/utils'
import { nanoid } from 'nanoid'

import { deleteFundPassword } from '~/features/fund-password/fundPasswordStorage'
import i18n from '~/features/localization/i18n'
import { deleteAddressKeyPair, generateAndStoreAddressKeypairForIndex } from '~/persistent-storage/addressKeys'
import { legacyGetWalletMetadata, legacyStoredMnemonicV2Exists } from '~/persistent-storage/legacyWallet'
import { storage } from '~/persistent-storage/storage'
import {
  deleteSecurelyWithReportableError,
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
import { getStoredWalletMetadata, getWalletMetadata, storeWalletMetadata } from '~/persistent-storage/walletMetadata'
import { walletMnemonicKey } from '~/persistent-storage/walletMnemonic'
import { GeneratedWallet, WalletStoredState } from '~/types/wallet'
import { getRandomLabelColor } from '~/utils/colors'

const isNewWalletKey = (walletId: string) => `is-new-wallet-${walletId}`
const isWalletFundedKey = (walletId: string) => `is-wallet-funded-${walletId}`
const walletOrdinalKey = (walletId: string) => `wallet-ordinal-${walletId}`
const gettingStartedActiveKey = (walletId: string) => `getting-started-active-${walletId}`

// Never decremented, so deleting a wallet cannot make a later one reuse an ordinal.
const WALLET_CREATION_COUNTER_KEY = 'wallet-creation-counter'

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
    assignWalletOrdinal(walletId)

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

export const createWatchOnlyWallet = (name: string, addressHash: string): WalletMetadataMobile => {
  const walletId = nanoid()

  const metadata: WalletMetadataMobile = {
    id: walletId,
    name,
    type: 'watch-only',
    isMnemonicBackedUp: true, // No mnemonic to back up
    addresses: [
      {
        index: 0,
        hash: addressHash,
        isDefault: true,
        color: getRandomLabelColor()
      } as AddressStoredMetadataWithHash
    ],
    contacts: []
  }

  storeWalletMetadata(walletId, metadata)
  addWalletToList(createWalletListEntry(walletId, name, 'watch-only'))
  assignWalletOrdinal(walletId)

  return metadata
}

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
  storage.delete(`wallet-metadata-${walletId}`)
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

export const getWalletOrdinal = (walletId: string): number | undefined => storage.getNumber(walletOrdinalKey(walletId))

const assignWalletOrdinal = (walletId: string) => {
  const ordinal = (storage.getNumber(WALLET_CREATION_COUNTER_KEY) ?? 0) + 1

  storeWithReportableError(WALLET_CREATION_COUNTER_KEY, ordinal)
  storeWithReportableError(walletOrdinalKey(walletId), ordinal)
}

export const getIsNewWallet = (walletId: string): boolean | undefined => storage.getBoolean(isNewWalletKey(walletId))

export const storeIsNewWallet = (walletId: string, isNew: boolean) =>
  storeWithReportableError(isNewWalletKey(walletId), isNew)

export const getIsWalletFunded = (walletId: string): boolean | undefined =>
  storage.getBoolean(isWalletFundedKey(walletId))

export const storeIsWalletFunded = (walletId: string, isFunded: boolean) =>
  storeWithReportableError(isWalletFundedKey(walletId), isFunded)

// Only wallets created or imported from this feature onward get the flag, so the checklist never
// appears on established wallets.
export const getIsGettingStartedActive = (walletId: string): boolean =>
  storage.getBoolean(gettingStartedActiveKey(walletId)) ?? false

export const storeIsGettingStartedActive = (walletId: string, isActive: boolean) =>
  storeWithReportableError(gettingStartedActiveKey(walletId), isActive)

const storeWalletMnemonic = async (walletId: string, mnemonic: Uint8Array) =>
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
