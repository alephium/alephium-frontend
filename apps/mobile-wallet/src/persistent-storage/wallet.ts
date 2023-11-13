/*
Copyright 2018 - 2023 The Alephium Authors
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
  deriveAddressAndKeys,
  walletEncryptAsyncUnsafe,
  walletGenerateAsyncUnsafe,
  walletImportAsyncUnsafe
} from '@alephium/shared'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { nanoid } from 'nanoid'
import { Platform } from 'react-native'

import { defaultBiometricsConfig, defaultSecureStoreConfig } from '~/persistent-storage/config'
import { loadBiometricsSettings, storeBiometricsSettings } from '~/persistent-storage/settings'
import { AddressMetadata, AddressPartial } from '~/types/addresses'
import { GeneratedWallet, Mnemonic, WalletMetadata, WalletState } from '~/types/wallet'
import { getRandomLabelColor } from '~/utils/colors'
import { mnemonicToSeed, pbkdf2 } from '~/utils/crypto'

const PIN_WALLET_STORAGE_KEY = 'wallet-pin'
const BIOMETRICS_WALLET_STORAGE_KEY = 'wallet-biometrics'
const WALLET_METADATA_STORAGE_KEY = 'wallet-metadata'
const IS_NEW_WALLET = 'is-new-wallet'

export const generateAndStoreWallet = async (
  name: WalletState['name'],
  pin: string,
  mnemonicToImport?: WalletState['mnemonic']
): Promise<GeneratedWallet> => {
  const isMnemonicBackedUp = !!mnemonicToImport

  const generatedWallet = mnemonicToImport
    ? await walletImportAsyncUnsafe(mnemonicToSeed, mnemonicToImport)
    : await walletGenerateAsyncUnsafe(mnemonicToSeed)

  const id = await persistWallet(name, generatedWallet.mnemonic, pin, isMnemonicBackedUp)

  return {
    id,
    name,
    mnemonic: generatedWallet.mnemonic,
    isMnemonicBackedUp,
    firstAddress: {
      index: 0,
      hash: generatedWallet.address,
      publicKey: generatedWallet.publicKey,
      privateKey: generatedWallet.privateKey
    }
  }
}

const persistWallet = async (
  walletName: string,
  mnemonic: Mnemonic,
  pin: string,
  isMnemonicBackedUp: boolean
): Promise<string> => {
  const encryptedWithPinMnemonic = await walletEncryptAsyncUnsafe(pin, mnemonic, pbkdf2)

  console.log('💽 Storing pin-encrypted mnemonic')
  await SecureStore.setItemAsync(PIN_WALLET_STORAGE_KEY, encryptedWithPinMnemonic, defaultSecureStoreConfig)

  console.log('💽 Storing wallet initial metadata')
  const walletMetadata = generateWalletMetadata(walletName, isMnemonicBackedUp)
  await storeWalletMetadata(walletMetadata)

  return walletMetadata.id
}

const storeWalletMetadata = async (metadata: WalletMetadata) => {
  await AsyncStorage.setItem(WALLET_METADATA_STORAGE_KEY, JSON.stringify(metadata))
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

export const enableBiometrics = async (mnemonic: Mnemonic) => {
  const options = { ...defaultBiometricsConfig, authenticationPrompt: 'Enable biometrics' }

  console.log('💽 Storing biometrics wallet')
  await SecureStore.setItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, mnemonic, options)

  if (Platform.OS === 'ios') {
    // Ensure we can actually get the secured mnemonic and force to show prompt
    await SecureStore.getItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, options)
  }
}

export const disableBiometrics = async () => {
  await SecureStore.deleteItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, defaultSecureStoreConfig)
}

export const getWalletMetadata = async (): Promise<WalletMetadata | null> => {
  const rawWalletMetadata = await AsyncStorage.getItem(WALLET_METADATA_STORAGE_KEY)

  return rawWalletMetadata ? JSON.parse(rawWalletMetadata) : null
}

export interface GetStoredWalletProps {
  forcePinUsage?: boolean
  authenticationPrompt?: SecureStore.SecureStoreOptions['authenticationPrompt']
}

export const getStoredWallet = async (props?: GetStoredWalletProps): Promise<WalletState | null> => {
  const metadata = await getWalletMetadata()

  if (!metadata) {
    await deleteWallet()
    return null
  }

  const { id, name, isMnemonicBackedUp } = metadata
  const usesBiometrics = await loadBiometricsSettings()

  const mnemonic =
    props?.forcePinUsage || !usesBiometrics
      ? await SecureStore.getItemAsync(PIN_WALLET_STORAGE_KEY, defaultSecureStoreConfig)
      : await SecureStore.getItemAsync(
          BIOMETRICS_WALLET_STORAGE_KEY,
          props?.authenticationPrompt
            ? {
                ...defaultBiometricsConfig,
                authenticationPrompt: props.authenticationPrompt
              }
            : defaultBiometricsConfig
        )

  // This should never be the case, but if we have metadata without wallet, we need to clear them
  if (!mnemonic) {
    await AsyncStorage.removeItem(WALLET_METADATA_STORAGE_KEY)
  }

  return mnemonic
    ? ({
        id,
        name,
        mnemonic,
        isMnemonicBackedUp
      } as WalletState)
    : null
}

export const deleteWallet = async () => {
  console.log('🗑️ Deleting pin-encrypted & biometrics wallet')

  await SecureStore.deleteItemAsync(PIN_WALLET_STORAGE_KEY, defaultSecureStoreConfig)
  await SecureStore.deleteItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, defaultSecureStoreConfig)
  await AsyncStorage.removeItem(WALLET_METADATA_STORAGE_KEY)
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

export const deriveWalletStoredAddresses = async (wallet: WalletState): Promise<AddressPartial[]> => {
  const { masterKey } = await walletImportAsyncUnsafe(mnemonicToSeed, wallet.mnemonic)
  const metadata = await getWalletMetadata()
  const addresses = metadata?.addresses ?? []

  console.log(`👀 Found ${addresses.length} addresses metadata in persistent storage`)

  return addresses.map(({ index, ...settings }) => ({ ...deriveAddressAndKeys(masterKey, index), settings }))
}

export const getIsNewWallet = async (): Promise<boolean> => (await AsyncStorage.getItem(IS_NEW_WALLET)) === 'true'

export const storeIsNewWallet = async (isNew: boolean) => await AsyncStorage.setItem(IS_NEW_WALLET, isNew.toString())
