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

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { nanoid } from 'nanoid'

import { ActiveWalletState } from '../store/activeWalletSlice'
import { AddressMetadata } from '../types/addresses'
import { StoredWalletAuthType, WalletMetadata } from '../types/wallet'

export const storeWallet = async (
  walletName: string,
  mnemonic: string,
  authType: StoredWalletAuthType,
  isMnemonicBackedUp: boolean
): Promise<string> => {
  const rawWalletsMetadata = await AsyncStorage.getItem('wallets-metadata')
  const walletsMetadata = rawWalletsMetadata ? JSON.parse(rawWalletsMetadata) : []
  const walletId = nanoid()

  walletsMetadata.push({
    id: walletId,
    name: walletName,
    authType,
    isMnemonicBackedUp,
    addresses: [
      {
        index: 0,
        isMain: true
      }
    ]
  })

  const secureStoreConfig = getSecureStoreConfig(authType, 'Please, authenticate to store your wallet securely')
  await SecureStore.setItemAsync(`wallet-${walletId}`, mnemonic, secureStoreConfig)

  await AsyncStorage.setItem('active-wallet-id', walletId)
  await AsyncStorage.setItem('wallets-metadata', JSON.stringify(walletsMetadata))

  return walletId
}

export const getStoredWalletById = async (id: string): Promise<ActiveWalletState | null> => {
  const { name, authType, isMnemonicBackedUp } = await getWalletMetadataById(id)

  const secureStoreConfig = getSecureStoreConfig(authType, `Please, authenticate to unlock "${name}"`)
  const mnemonic = await SecureStore.getItemAsync(`wallet-${id}`, secureStoreConfig)

  if (!mnemonic) throw 'Could not find wallet'

  return {
    name,
    mnemonic,
    authType,
    metadataId: id,
    isMnemonicBackedUp
  } as ActiveWalletState
}

export const getStoredActiveWallet = async (): Promise<ActiveWalletState | null> => {
  const id = await AsyncStorage.getItem('active-wallet-id')
  if (!id) return null

  return await getStoredWalletById(id)
}

export const deleteWalletById = async (id: string) => {
  const walletsMetadata = await getWalletsMetadata()
  const index = walletsMetadata.findIndex((data: WalletMetadata) => data.id === id)

  if (index < 0) throw 'Could not find wallet'

  const walletMetadata = walletsMetadata[index]

  walletsMetadata.splice(index, 1)
  await AsyncStorage.setItem('wallets-metadata', JSON.stringify(walletsMetadata))

  const activeWalletId = await AsyncStorage.getItem('active-wallet-id')
  if (activeWalletId === id) {
    await AsyncStorage.removeItem('active-wallet-id')
  }

  await deleteWallet(walletMetadata)
}

export const deleteAllWallets = async () => {
  const walletsMetadata = await getWalletsMetadata()

  for (const walletMetadata of walletsMetadata) {
    await deleteWallet(walletMetadata)
  }

  await AsyncStorage.removeItem('wallets-metadata')
  await AsyncStorage.removeItem('active-wallet-id')
}

const deleteWallet = async ({ id, name, authType }: WalletMetadata) => {
  const secureStoreConfig = getSecureStoreConfig(authType, `Please, authenticate to delete the wallet named "${name}"`)

  return await SecureStore.deleteItemAsync(`wallet-${id}`, secureStoreConfig)
}

export const areThereOtherWallets = async (): Promise<boolean> => {
  const rawWalletsMetadata = await AsyncStorage.getItem('wallets-metadata')
  if (!rawWalletsMetadata) return false

  const walletsMetadata = JSON.parse(rawWalletsMetadata) as WalletMetadata[]

  return Array.isArray(walletsMetadata) && walletsMetadata.length > 0
}

const getWalletMetadataById = async (id: string): Promise<WalletMetadata> => {
  const walletsMetadata = await getWalletsMetadata()

  return walletsMetadata.find((wallet: WalletMetadata) => wallet.id === id) as WalletMetadata
}

export const storePartialWalletMetadata = async (id: string, partialMetadata: Partial<WalletMetadata>) => {
  const walletsMetadata = await getWalletsMetadata()
  const existingWalletMetadata = walletsMetadata.find((wallet: WalletMetadata) => wallet.id === id)

  if (existingWalletMetadata) {
    Object.assign(existingWalletMetadata, partialMetadata)

    await AsyncStorage.setItem('wallets-metadata', JSON.stringify(walletsMetadata))
  }
}

export const storeAddressMetadata = async (walletId: string, addressMetadata: AddressMetadata) => {
  const walletsMetadata = await getWalletsMetadata()
  const walletMetadata = walletsMetadata.find((wallet: WalletMetadata) => wallet.id === walletId) as WalletMetadata
  const existingAddressMetadata = walletMetadata.addresses.find((data) => data.index === addressMetadata.index)

  if (existingAddressMetadata) {
    Object.assign(existingAddressMetadata, addressMetadata)
  } else {
    walletMetadata.addresses.push(addressMetadata)
  }

  console.log(`💽 Storing address index ${addressMetadata.index} metadata in persistent storage`)
  await AsyncStorage.setItem('wallets-metadata', JSON.stringify(walletsMetadata))
}

export const getAddressesMetadataByWalletId = async (id: string): Promise<AddressMetadata[]> => {
  const walletMetadata = await getWalletMetadataById(id)

  return walletMetadata.addresses
}

export const getWalletsMetadata = async (): Promise<WalletMetadata[]> => {
  const rawWalletsMetadata = await AsyncStorage.getItem('wallets-metadata')
  if (!rawWalletsMetadata) throw 'No wallets found'

  return JSON.parse(rawWalletsMetadata)
}

export const changeActiveWallet = async (walletId: string) => {
  await AsyncStorage.setItem('active-wallet-id', walletId)
}

const getSecureStoreConfig = (authType: StoredWalletAuthType, message: string) =>
  authType === 'biometrics'
    ? {
        requireAuthentication: true,
        authenticationPrompt: message,
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
      }
    : {}
