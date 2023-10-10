/*
Copyright 2018 - 2022 The Alephium Authors
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
} from '@alephium/sdk'
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
  await persistWalletMetadata(walletMetadata)

  return walletMetadata.id
}

export const persistWalletMetadata = async (partialMetadata: Partial<WalletMetadata>) => {
  const walletMetadata = await getWalletMetadata()

  const updatedWalletMetadata = { ...walletMetadata, ...partialMetadata }

  await AsyncStorage.setItem(WALLET_METADATA_STORAGE_KEY, JSON.stringify(updatedWalletMetadata))
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
  console.log('💽 Storing biometrics wallet')
  await SecureStore.setItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, mnemonic, defaultBiometricsConfig)

  if (Platform.OS === 'ios') {
    // Ensure we can actually get the secured mnemonic and force to show prompt
    await SecureStore.getItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, defaultBiometricsConfig)
  }
}

export const disableBiometrics = async () => {
  await SecureStore.deleteItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, defaultSecureStoreConfig)
}

export const getWalletMetadata = async (): Promise<WalletMetadata> => {
  const rawWalletMetadata = await AsyncStorage.getItem(WALLET_METADATA_STORAGE_KEY)

  return rawWalletMetadata ? JSON.parse(rawWalletMetadata) : generateWalletMetadata('Wallet')
}

export const getStoredWallet = async (forcePinUsage?: boolean): Promise<WalletState | null> => {
  const { id, name, isMnemonicBackedUp } = await getWalletMetadata()
  const usesBiometrics = await loadBiometricsSettings()

  const mnemonic =
    forcePinUsage || !usesBiometrics
      ? await SecureStore.getItemAsync(PIN_WALLET_STORAGE_KEY, defaultSecureStoreConfig)
      : await SecureStore.getItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, defaultBiometricsConfig)

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

  for (const metadata of addressesMetadata) {
    const addressIndex = walletMetadata.addresses.findIndex((data) => data.index === metadata.index)

    if (addressIndex >= 0) {
      walletMetadata.addresses.splice(addressIndex, 1, metadata)
    } else {
      walletMetadata.addresses.push(metadata)
    }

    console.log(`💽 Storing address index ${metadata.index} metadata in persistent storage`)
  }

  await persistWalletMetadata(walletMetadata)
}

export const deriveWalletStoredAddresses = async (wallet: WalletState): Promise<AddressPartial[]> => {
  const { masterKey } = await walletImportAsyncUnsafe(mnemonicToSeed, wallet.mnemonic)
  const { addresses } = await getWalletMetadata()

  console.log(`👀 Found ${addresses.length} addresses metadata in persistent storage`)

  return addresses.map(({ index, ...settings }) => ({ ...deriveAddressAndKeys(masterKey, index), settings }))
}

export const getIsNewWallet = async (): Promise<boolean> => (await AsyncStorage.getItem(IS_NEW_WALLET)) === 'true'

export const storeIsNewWallet = async (isNew: boolean) => await AsyncStorage.setItem(IS_NEW_WALLET, isNew.toString())
