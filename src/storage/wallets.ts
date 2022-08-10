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

const keychainService = 'alephium-mobile-wallet'

export const storeWallet = async (
  walletName: string,
  mnemonic: string,
  authType: StoredWalletAuthType
): Promise<string> => {
  const getWalletMetadataInitialValue = (id: string): WalletMetadata => ({
    id,
    name: walletName,
    authType,
    addresses: [
      {
        index: 0,
        isMain: true
      }
    ]
  })

  let walletId: string
  let walletsMetadata = []

  const rawWalletsMetadata = await AsyncStorage.getItem('wallets-metadata')

  if (!rawWalletsMetadata) {
    // Storing first wallet ever, after a fresh app install
    walletId = nanoid()
    const initialWalletsMetadata: WalletMetadata[] = [getWalletMetadataInitialValue(walletId)]
    await AsyncStorage.setItem('wallets-metadata', JSON.stringify(initialWalletsMetadata))
  } else {
    // Storing an additonal wallet, after at least one has been created and stored
    walletsMetadata = JSON.parse(rawWalletsMetadata) as WalletMetadata[]
    const walletMetadata = walletsMetadata.find((data: WalletMetadata) => data.name === walletName)

    if (walletMetadata) {
      // Will override stored wallet with the same name
      walletId = walletMetadata.id
    } else {
      // Will store a new wallet
      walletId = nanoid()
      const newWalletMetadata: WalletMetadata = getWalletMetadataInitialValue(walletId)
      walletsMetadata.push(newWalletMetadata)
      await AsyncStorage.setItem('wallets-metadata', JSON.stringify(walletsMetadata))
    }
  }

  const secureStoreConfig =
    authType === 'biometrics'
      ? {
          requireAuthentication: true,
          authenticationPrompt: 'Please, authenticate to store your wallet securely'
        }
      : {
          keychainService
        }

  await SecureStore.setItemAsync(`wallet-${walletId}`, mnemonic, secureStoreConfig)
  await AsyncStorage.setItem('active-wallet-id', walletId)

  return walletId
}

export const getStoredWalletById = async (id: string): Promise<ActiveWalletState | null> => {
  const { name, authType } = await getWalletMetadataById(id)

  const secureStoreConfig =
    authType === 'biometrics'
      ? {
          requireAuthentication: true,
          authenticationPrompt: `Please, authenticate to unlock "${name}"`
        }
      : {
          keychainService
        }

  const mnemonic = await SecureStore.getItemAsync(`wallet-${id}`, secureStoreConfig)

  if (!mnemonic) throw 'Could not find wallet'

  return {
    name,
    mnemonic,
    authType,
    metadataId: id
  } as ActiveWalletState
}

export const getStoredActiveWallet = async (): Promise<ActiveWalletState | null> => {
  const id = await AsyncStorage.getItem('active-wallet-id')
  if (!id) return null

  return await getStoredWalletById(id)
}

export const deleteWalletByName = async (walletName: string) => {
  const walletsMetadata = await getWalletsMetadata()
  const index = walletsMetadata.findIndex((data: WalletMetadata) => data.name === walletName)

  if (index < 0) throw 'Could not find wallet'

  const walletMetadata = walletsMetadata[index]

  walletsMetadata.splice(index, 1)
  await AsyncStorage.setItem('wallets-metadata', JSON.stringify(walletsMetadata))

  const activeWalletId = await AsyncStorage.getItem('active-wallet-id')
  if (activeWalletId === walletMetadata.id) {
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

const deleteWallet = async (walletMetadata: WalletMetadata) => {
  const secureStoreConfig =
    walletMetadata.authType === 'biometrics'
      ? {
          requireAuthentication: true,
          authenticationPrompt: `Please, authenticate to delete the wallet named "${walletMetadata.name}"`
        }
      : {
          keychainService
        }
  await SecureStore.deleteItemAsync(`wallet-${walletMetadata.id}`, secureStoreConfig)
}

const getWalletMetadataById = async (id: string): Promise<WalletMetadata> => {
  const walletsMetadata = await getWalletsMetadata()
  return walletsMetadata.find((wallet: WalletMetadata) => wallet.id === id) as WalletMetadata
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
