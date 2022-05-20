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
import { StoredWalletAuthType, WalletMetadata } from '../types/wallet'

export const storeWallet = async (walletName: string, mnemonic: string, authType: StoredWalletAuthType) => {
  let walletId: string
  let walletsMetadata = []

  const rawWalletsMetadata = await AsyncStorage.getItem('wallets-metadata')

  if (!rawWalletsMetadata) {
    // Storing first wallet ever, after a fresh app install
    walletId = nanoid()
    const initialWalletsMetadata: WalletMetadata[] = [
      {
        id: walletId,
        name: walletName,
        authType
      }
    ]
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
      const newWalletMetadata: WalletMetadata = {
        id: walletId,
        name: walletName,
        authType
      }
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
      : undefined

  await SecureStore.setItemAsync(`wallet-${walletId}`, mnemonic, secureStoreConfig)
  await SecureStore.setItemAsync('active-wallet-id', walletId)
}

export const getActiveWallet = async (): Promise<ActiveWalletState | null> => {
  const id = await SecureStore.getItemAsync('active-wallet-id')
  if (!id) return null

  const { name, authType } = await getWalletMetadataById(id)

  const secureStoreConfig =
    authType === 'biometrics'
      ? {
          requireAuthentication: true,
          authenticationPrompt: 'Please, authenticate to unlock your wallet'
        }
      : undefined

  const mnemonic = await SecureStore.getItemAsync(`wallet-${id}`, secureStoreConfig)

  if (!mnemonic) throw 'Could not find wallet'

  return {
    name,
    mnemonic,
    authType
  } as ActiveWalletState
}

export const deleteEncryptedWallet = async (walletName: string) => {
  const rawWalletsMetadata = await AsyncStorage.getItem('wallets-metadata')

  if (!rawWalletsMetadata) throw 'No wallets found'

  const walletsMetadata = JSON.parse(rawWalletsMetadata)
  const walletMetadata = walletsMetadata.find((wallet: WalletMetadata) => wallet.name === walletName)

  if (!walletMetadata) throw 'Could not find wallet'

  walletsMetadata.splice(
    walletsMetadata.findIndex((data: WalletMetadata) => data.name === walletName),
    1
  )
  await AsyncStorage.setItem('wallets-metadata', JSON.stringify(walletsMetadata))

  const secureStoreConfig =
    walletMetadata.authType === 'biometrics'
      ? {
          requireAuthentication: true,
          authenticationPrompt: 'Please, authenticate to delete the wallet'
        }
      : undefined
  await SecureStore.deleteItemAsync(`wallet-${walletMetadata.id}`, secureStoreConfig)
}

const getWalletMetadataById = async (id: string): Promise<WalletMetadata> => {
  const rawWalletsMetadata = await AsyncStorage.getItem('wallets-metadata')
  if (!rawWalletsMetadata) throw 'No wallets found'

  const walletsMetadata = JSON.parse(rawWalletsMetadata)
  return walletsMetadata.find((wallet: WalletMetadata) => wallet.id === id) as WalletMetadata
}
