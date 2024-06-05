/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import {
  dangerouslyConvertUint8ArrayMnemonicToString,
  keyring,
  mnemonicJsonStringifiedObjectToUint8Array
} from '@alephium/keyring'
import { AddressHash, resetArray } from '@alephium/shared'
import * as SecureStore from 'expo-secure-store'
import { nanoid } from 'nanoid'

import { sendAnalytics } from '~/analytics'
import { deleteFundPassword } from '~/features/fund-password/fundPasswordStorage'
import { defaultBiometricsConfig } from '~/persistent-storage/config'
import { loadBiometricsSettings } from '~/persistent-storage/settings'
import {
  deleteSecurelyWithReportableError,
  deleteWithReportableError,
  getSecurelyWithReportableError,
  getWithReportableError,
  storeSecurelyWithReportableError,
  storeWithReportableError
} from '~/persistent-storage/utils'
import { AddressMetadataWithHash } from '~/types/addresses'
import {
  DeprecatedWalletMetadata,
  DeprecatedWalletState,
  GeneratedWallet,
  WalletMetadata,
  WalletStoredState
} from '~/types/wallet'
import { getRandomLabelColor } from '~/utils/colors'

const PIN_WALLET_STORAGE_KEY = 'wallet-pin'
const BIOMETRICS_WALLET_STORAGE_KEY = 'wallet-biometrics'
const WALLET_METADATA_STORAGE_KEY = 'wallet-metadata'
const IS_NEW_WALLET = 'is-new-wallet'
const MNEMONIC_V2 = 'wallet-mnemonic-v2'
const ADDRESS_PUB_KEY_PREFIX = 'address-pub-key-'
const ADDRESS_PRIV_KEY_PREFIX = 'address-priv-key-'

export const generateAndStoreWallet = async (
  name: WalletStoredState['name'],
  mnemonicToImport?: string
): Promise<GeneratedWallet> => {
  const isMnemonicBackedUp = !!mnemonicToImport

  try {
    const mnemonicUint8Array = mnemonicToImport
      ? keyring.importMnemonicString(mnemonicToImport)
      : keyring.generateRandomMnemonic()

    await storeWalletMnemonic(mnemonicUint8Array)

    const firstAddressHash = await generateAndStoreAddressKeypairForIndex(0)
    const walletMetadata = generateWalletMetadata(name, firstAddressHash, isMnemonicBackedUp)
    await storeWalletMetadata(walletMetadata)

    return {
      id: walletMetadata.id,
      name,
      isMnemonicBackedUp,
      firstAddress: {
        index: 0,
        hash: firstAddressHash
      }
    }
  } finally {
    keyring.clear()
  }
}

export const getWalletMetadata = async (): Promise<WalletMetadata | null> => {
  const rawWalletMetadata = await getWithReportableError(WALLET_METADATA_STORAGE_KEY)

  try {
    return rawWalletMetadata ? JSON.parse(rawWalletMetadata) : null
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: 'Could not parse wallet metadata' })
    throw error
  }
}

export const getStoredWallet = async (error?: string): Promise<WalletMetadata> => {
  const walletMetadata = await getWalletMetadata()

  if (!walletMetadata) throw new Error(error || 'Could not get stored wallet: metadata not found')

  return walletMetadata
}

export const updateStoredWalletMetadata = async (partialMetadata: Partial<WalletMetadata>) => {
  const walletMetadata = await getStoredWallet('Could not persist wallet metadata, no entry found in storage')
  const updatedWalletMetadata = { ...walletMetadata, ...partialMetadata }

  await storeWalletMetadata(updatedWalletMetadata)
}

export interface GetDeprecatedStoredWalletProps {
  forcePinUsage?: boolean
  authenticationPrompt?: SecureStore.SecureStoreOptions['authenticationPrompt']
}

export const getDeprecatedStoredWallet = async (
  props?: GetDeprecatedStoredWalletProps
): Promise<DeprecatedWalletState | null> => {
  const metadata = await getWalletMetadata()

  if (!metadata) {
    return null
  }

  const { id, name, isMnemonicBackedUp } = metadata
  const usesBiometrics = await loadBiometricsSettings()

  let mnemonic: string | null = null

  if (!props?.forcePinUsage && usesBiometrics) {
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

export const deleteWallet = async () => {
  await deleteSecurelyWithReportableError(MNEMONIC_V2, true, '')
  await deleteFundPassword()

  const wallet = await getStoredWallet()

  for (const address of wallet.addresses) {
    await deleteAddressPublicKey(address.hash)
    await deleteAddressPrivateKey(address.hash)
  }

  await deleteWithReportableError(WALLET_METADATA_STORAGE_KEY)
  await deleteWithReportableError(IS_NEW_WALLET)
}

export const persistAddressesMetadata = async (walletId: string, addressesMetadata: AddressMetadataWithHash[]) => {
  const walletMetadata = await getStoredWallet('Could not persist addresses metadata, wallet metadata not found')

  for (const metadata of addressesMetadata) {
    const addressIndex = walletMetadata.addresses.findIndex((data) => data.index === metadata.index)

    if (addressIndex >= 0) {
      walletMetadata.addresses.splice(addressIndex, 1, metadata)
    } else {
      walletMetadata.addresses.push(metadata)
    }

    console.log(`💽 Storing address index ${metadata.index} metadata in persistent storage`)
  }

  await storeWalletMetadata(walletMetadata)
}

export const getIsNewWallet = async (): Promise<boolean | undefined> =>
  (await getWithReportableError(IS_NEW_WALLET)) === 'true'

export const storeIsNewWallet = async (isNew: boolean) => storeWithReportableError(IS_NEW_WALLET, isNew.toString())

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
  // Step 1: Store mnemonic as Uint8Array in secure store without authentication required (as per Uniswap)
  const mnemonicUint8Array = keyring.importMnemonicString(deprecatedMnemonic)

  try {
    await storeWalletMnemonic(mnemonicUint8Array)

    // Step 2: Delete old mnemonic records
    await deleteDeprecatedWallet()

    // Step 3: Add hash in address metadata for faster app unlock and store public and private key in secure store
    const { addresses } = await getStoredWallet('Could not migrate address metadata, wallet metadata not found')
    const updatedAddressesMetadata: AddressMetadataWithHash[] = []

    for (const address of addresses) {
      const { hash, publicKey } = keyring.generateAndCacheAddress({ addressIndex: address.index })
      let privateKey = keyring.exportPrivateKeyOfAddress(hash)

      await storeAddressPublicKey(hash, publicKey)
      await storeAddressPrivateKey(hash, privateKey)

      privateKey = ''

      updatedAddressesMetadata.push({
        ...address,
        hash
      })
    }

    await updateStoredWalletMetadata({ addresses: updatedAddressesMetadata })
  } finally {
    keyring.clear()
  }
}

export const storedWalletExists = async (): Promise<boolean> =>
  !!(await getSecurelyWithReportableError(MNEMONIC_V2, true, '')) && !!(await getWalletMetadata())

export const dangerouslyExportWalletMnemonic = async (): Promise<string> => {
  const decryptedMnemonic = await getSecurelyWithReportableError(MNEMONIC_V2, true, '')

  if (!decryptedMnemonic) throw new Error('Could not export mnemonic: could not find stored wallet')

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))

  return dangerouslyConvertUint8ArrayMnemonicToString(parsedDecryptedMnemonic)
}

export const getAddressAsymetricKey = async (addressHash: AddressHash, keyType: 'public' | 'private') => {
  const storageKey = (keyType === 'public' ? ADDRESS_PUB_KEY_PREFIX : ADDRESS_PRIV_KEY_PREFIX) + addressHash
  let key = await getSecurelyWithReportableError(storageKey, false, `Could not get ${keyType} from secure storage`)

  if (!key) {
    const { addresses } = await getStoredWallet(`Could not get address ${keyType} key, wallet metadata not found`)
    const address = addresses.find((address) => address.hash === addressHash)

    if (!address) throw new Error(`Could not get address ${keyType} key, address metadata not found`)

    await generateAndStoreAddressKeypairForIndex(address.index)
    key = await getSecurelyWithReportableError(storageKey, false, `Could not get ${keyType} from secure storage`)

    if (!key) throw new Error(`Could not generate address ${keyType} key`)
  }

  return key
}

const generateWalletMetadata = (name: string, firstAddressHash: string, isMnemonicBackedUp = false) => ({
  id: nanoid(),
  name,
  isMnemonicBackedUp,
  addresses: [
    {
      index: 0,
      hash: firstAddressHash,
      isDefault: true,
      color: getRandomLabelColor()
    }
  ],
  contacts: []
})

export const storeWalletMetadata = async (metadata: WalletMetadata) =>
  storeWithReportableError(WALLET_METADATA_STORAGE_KEY, JSON.stringify(metadata))

export const storeWalletMetadataDeprecated = async (metadata: DeprecatedWalletMetadata) =>
  storeWithReportableError(WALLET_METADATA_STORAGE_KEY, JSON.stringify(metadata))

const storeWalletMnemonic = async (mnemonic: Uint8Array) =>
  storeSecurelyWithReportableError(MNEMONIC_V2, JSON.stringify(mnemonic), true, '')

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

const generateAndStoreAddressKeypairForIndex = async (addressIndex: number): Promise<AddressHash> => {
  try {
    if (!keyring.isInitialized()) await initializeKeyringWithStoredWallet()

    const { hash, publicKey } = keyring.generateAndCacheAddress({ addressIndex })
    let privateKey = keyring.exportPrivateKeyOfAddress(hash)

    await storeAddressPublicKey(hash, publicKey)
    await storeAddressPrivateKey(hash, privateKey)

    privateKey = ''

    return hash
  } finally {
    keyring.clear()
  }
}

export const initializeKeyringWithStoredWallet = async () => {
  let decryptedMnemonic = await getSecurelyWithReportableError(MNEMONIC_V2, true, '')
  if (!decryptedMnemonic) throw new Error('Could not initialize keyring: could not find stored wallet')

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))
  keyring.initFromDecryptedMnemonic(parsedDecryptedMnemonic, '')

  decryptedMnemonic = ''
  resetArray(parsedDecryptedMnemonic)
}
