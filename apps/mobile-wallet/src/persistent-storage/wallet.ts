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
import { AddressMetadata, getHumanReadableError } from '@alephium/shared'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { nanoid } from 'nanoid'
import { Platform } from 'react-native'

import { sendAnalytics } from '~/analytics'
import { defaultBiometricsConfig, defaultSecureStoreConfig } from '~/persistent-storage/config'
import { loadBiometricsSettings, storeBiometricsSettings } from '~/persistent-storage/settings'
import { AddressPartial } from '~/types/addresses'
import {
  DeprecatedMnemonic,
  DeprecatedWalletState,
  GeneratedWallet,
  WalletMetadata,
  WalletState,
  WalletStoredState
} from '~/types/wallet'
import { getRandomLabelColor } from '~/utils/colors'

const PIN_WALLET_STORAGE_KEY = 'wallet-pin'
const BIOMETRICS_WALLET_STORAGE_KEY = 'wallet-biometrics'
const WALLET_METADATA_STORAGE_KEY = 'wallet-metadata'
const IS_NEW_WALLET = 'is-new-wallet'
const BIOMETRICS_SETTINGS_CHANGED = 'biometrics-settings-changed'

export const generateAndStoreWallet = async (
  name: WalletStoredState['name'],
  mnemonicToImport?: string
): Promise<GeneratedWallet> => {
  const isMnemonicBackedUp = !!mnemonicToImport

  const mnemonicUint8Array = mnemonicToImport
    ? keyring.importMnemonicString(mnemonicToImport)
    : keyring.generateRandomMnemonic()
  const firstAddress = keyring.generateAndCacheAddress({ addressIndex: 0 })

  const id = await persistWallet(name, mnemonicUint8Array, isMnemonicBackedUp)

  return {
    id,
    name,
    isMnemonicBackedUp,
    firstAddress
  }
}

const persistWallet = async (
  walletName: string,
  mnemonic: Uint8Array,
  isMnemonicBackedUp: boolean
): Promise<WalletState['id']> => {
  console.log('💽 Storing mnemonic')
  await SecureStore.setItemAsync('wallet-mnemonic-v2', JSON.stringify(mnemonic), defaultSecureStoreConfig)

  console.log('💽 Storing wallet initial metadata')
  const walletMetadata = generateWalletMetadata(walletName, isMnemonicBackedUp)
  await storeWalletMetadata(walletMetadata)

  return walletMetadata.id
}

const storeWalletMetadata = async (metadata: WalletMetadata) => {
  try {
    await AsyncStorage.setItem(WALLET_METADATA_STORAGE_KEY, JSON.stringify(metadata))
  } catch (e) {
    sendAnalytics('Error', { message: 'Could not store wallet metadata to storage' })
    console.error(e)
  }
}

export const persistWalletMetadata = async (partialMetadata: Partial<WalletMetadata>) => {
  const walletMetadata = await getWalletMetadata()

  if (!walletMetadata) throw new Error('Could not persist wallet metadata, no entry found in storage')

  const updatedWalletMetadata = { ...walletMetadata, ...partialMetadata }

  await storeWalletMetadata(updatedWalletMetadata)
}

const generateWalletMetadata = (name: string, isMnemonicBackedUp = false) => ({
  id: nanoid(),
  name,
  isMnemonicBackedUp,
  addresses: [
    {
      index: 0,
      isDefault: true,
      color: getRandomLabelColor()
    }
  ],
  contacts: []
})

export const enableBiometrics = async (mnemonic: DeprecatedMnemonic, authenticationPrompt = 'Enable biometrics') => {
  const options = { ...defaultBiometricsConfig, authenticationPrompt }

  console.log('💽 Storing biometrics wallet')

  await SecureStore.setItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, mnemonic, options)

  if (Platform.OS === 'ios') {
    // Ensure we can actually get the secured mnemonic and force to show prompt
    await SecureStore.getItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, options)
  }

  try {
    const biometricsChangedFlag = await AsyncStorage.getItem(BIOMETRICS_SETTINGS_CHANGED)
    if (biometricsChangedFlag) await AsyncStorage.removeItem(BIOMETRICS_SETTINGS_CHANGED)
  } catch (e) {
    sendAnalytics('Error', {
      message: `Could not read and delete ${BIOMETRICS_SETTINGS_CHANGED} flag from storage`,
      exception: getHumanReadableError(e, '')
    })
    console.error(e)
  }
}

export const disableBiometrics = async () => {
  await SecureStore.deleteItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, defaultSecureStoreConfig)
}

export const getWalletMetadata = async (): Promise<WalletMetadata | null> => {
  try {
    const rawWalletMetadata = await AsyncStorage.getItem(WALLET_METADATA_STORAGE_KEY)

    return rawWalletMetadata ? JSON.parse(rawWalletMetadata) : null
  } catch (e) {
    sendAnalytics('Error', { message: 'Could not get wallet metadata from storage' })
    console.error(e)

    return null
  }
}

export const getStoredWallet = async (
  needsAddressRegeneration?: boolean
): Promise<WalletMetadata & { addressesToInitialize: AddressPartial[] }> => {
  const walletMetadata = await getWalletMetadata()

  if (!walletMetadata) throw new Error('Could not get stored wallet: metadata not found')

  let addressesToInitialize: AddressPartial[] = []

  if (needsAddressRegeneration) {
    addressesToInitialize = walletMetadata.addresses.map(({ index, ...settings }) => ({
      ...keyring.generateAndCacheAddress({ addressIndex: index }),
      settings
    }))
  }

  return { ...walletMetadata, addressesToInitialize }
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
    mnemonic = await SecureStore.getItemAsync(PIN_WALLET_STORAGE_KEY, defaultSecureStoreConfig)

    // This is the case where biometrics were enabled, but something changed in the security settings of the device (new
    // fingerprint or face ID was added)
    if (!props?.forcePinUsage && usesBiometrics) {
      await disableBiometrics()
      await storeBiometricsSettings(false)

      try {
        await AsyncStorage.setItem(BIOMETRICS_SETTINGS_CHANGED, 'true')
      } catch (e) {
        sendAnalytics('Error', {
          message: `Could not set ${BIOMETRICS_SETTINGS_CHANGED} flag to storage`,
          exception: getHumanReadableError(e, '')
        })
        console.error(e)
      }
    }
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
  console.log('🗑️ Deleting pin-encrypted & biometrics wallet')

  try {
    await SecureStore.deleteItemAsync(PIN_WALLET_STORAGE_KEY, defaultSecureStoreConfig)
    await SecureStore.deleteItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, defaultSecureStoreConfig)
  } catch (e) {
    sendAnalytics('Error', { message: 'Could not delete wallet from secure storage' })
    console.error(e)
  }

  try {
    await AsyncStorage.removeItem(WALLET_METADATA_STORAGE_KEY)
  } catch (e) {
    sendAnalytics('Error', { message: 'Could not delete wallet metadata from storage' })
    console.error(e)
  }
  await storeBiometricsSettings(false)
}

export const persistAddressesMetadata = async (walletId: string, addressesMetadata: AddressMetadata[]) => {
  const walletMetadata = await getWalletMetadata()

  if (!walletMetadata)
    throw new Error('Could not persist addresses metadata, no wallet metadata entry found in storage')

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

export const getIsNewWallet = async (): Promise<boolean | undefined> => {
  try {
    return (await AsyncStorage.getItem(IS_NEW_WALLET)) === 'true'
  } catch (e) {
    sendAnalytics('Error', {
      message: 'Could not get "is-new-wallet" flag from storage',
      exception: getHumanReadableError(e, '')
    })
    console.error(e)
  }
}

export const storeIsNewWallet = async (isNew: boolean) => {
  try {
    await AsyncStorage.setItem(IS_NEW_WALLET, isNew.toString())
  } catch (e) {
    sendAnalytics('Error', {
      message: 'Could not set "is-new-wallet" flag to storage',
      exception: getHumanReadableError(e, '')
    })
    console.error(e)
  }
}

export const initializeWalletFromStorage = async () => {
  const decryptedMnemonic = await SecureStore.getItemAsync('wallet-mnemonic-v2', defaultSecureStoreConfig)

  if (!decryptedMnemonic) throw new Error('Could not initialize wallet: could not find stored wallet')

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))
  keyring.initFromDecryptedMnemonic(parsedDecryptedMnemonic, '')
}

export const migrateDeprecatedMnemonic = async (deprecatedMnemonic: string) => {
  // Delete old mnemonic records and store mnemonic as Uint8Array in secure store without authentication required
  // like Uniswap does
  const mnemonicUint8Array = keyring.importMnemonicString(deprecatedMnemonic)
  const mnemonicStringified = JSON.stringify(mnemonicUint8Array)
  await SecureStore.setItemAsync('wallet-mnemonic-v2', mnemonicStringified, defaultSecureStoreConfig)
  await SecureStore.deleteItemAsync(PIN_WALLET_STORAGE_KEY, defaultSecureStoreConfig)
  await SecureStore.deleteItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, defaultSecureStoreConfig)
}

export const dangerouslyExportWalletMnemonic = async (): Promise<string> => {
  const decryptedMnemonic = await SecureStore.getItemAsync('wallet-mnemonic-v2', defaultSecureStoreConfig)

  if (!decryptedMnemonic) throw new Error('Could not export mnemonic: could not find stored wallet')

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))

  return dangerouslyConvertUint8ArrayMnemonicToString(parsedDecryptedMnemonic)
}
