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

import { AddressMetadata, AddressPartial } from '~/types/addresses'
import { ActiveWalletState, GeneratedWallet, Mnemonic, WalletMetadata } from '~/types/wallet'
import { getRandomLabelColor } from '~/utils/colors'
import { mnemonicToSeed, pbkdf2 } from '~/utils/crypto'

const defaultBiometricsConfig = {
  requireAuthentication: true,
  authenticationPrompt: 'Please authenticate',
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
}

export const generateAndStoreWallet = async (
  name: ActiveWalletState['name'],
  pin: string,
  mnemonicToImport?: ActiveWalletState['mnemonic']
): Promise<GeneratedWallet> => {
  const isMnemonicBackedUp = !!mnemonicToImport

  const wallets = await getWalletsMetadata()
  const walletNames = wallets.map(({ name }) => name)

  if (walletNames.includes(name)) throw new Error('A wallet with this name already exists')

  const wallet = mnemonicToImport
    ? await walletImportAsyncUnsafe(mnemonicToSeed, mnemonicToImport)
    : await walletGenerateAsyncUnsafe(mnemonicToSeed)

  const metadataId = await persistWallet(name, wallet.mnemonic, pin, isMnemonicBackedUp)

  return {
    name,
    metadataId,
    mnemonic: wallet.mnemonic,
    isMnemonicBackedUp,
    firstAddress: {
      index: 0,
      hash: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey
    }
  }
}

const persistWallet = async (
  walletName: string,
  mnemonic: Mnemonic,
  pin: string,
  isMnemonicBackedUp: boolean
): Promise<string> => {
  const walletsMetadata = await getWalletsMetadata()
  const walletId = nanoid()

  walletsMetadata.push({
    id: walletId,
    name: walletName,
    authType: 'pin',
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

  const encryptedWithPinMnemonic = await walletEncryptAsyncUnsafe(pin, mnemonic, pbkdf2)
  console.log(`💽 Storing pin-encrypted mnemonic of wallet with ID ${walletId}`)
  await SecureStore.setItemAsync(`wallet-${walletId}`, encryptedWithPinMnemonic)

  await rememberActiveWallet(walletId)
  await persistWalletsMetadata(walletsMetadata)

  return walletId
}

export const enableBiometrics = async (walletId: string, mnemonic: Mnemonic) => {
  const { authType } = await getWalletMetadataById(walletId)

  if (authType === 'biometrics') throw `Biometrics is already enabled for wallet with ID ${walletId}`

  console.log(`💽 Storing biometrics-enabled mnemonic for wallet with ID ${walletId}`)
  await SecureStore.setItemAsync(`wallet-biometrics-${walletId}`, mnemonic, {
    ...defaultBiometricsConfig,
    authenticationPrompt: 'Please authenticate to enable biometrics'
  })
  await persistWalletMetadata(walletId, { authType: 'biometrics' })
}

export const disableBiometrics = async (walletId: string) => {
  const { authType, name } = await getWalletMetadataById(walletId)

  if (authType === 'pin') {
    console.warn('Biometrics is already disabled')
    return
  }

  await persistWalletMetadata(walletId, { authType: 'pin' })
  await deleteBiometricsEnabledMnemonic(walletId, name)
}

export const getStoredWalletById = async (id: string, usePin?: boolean): Promise<ActiveWalletState> => {
  const { name, authType: preferredAuthType, isMnemonicBackedUp } = await getWalletMetadataById(id)

  const authType = usePin ? 'pin' : preferredAuthType
  const mnemonic =
    authType === 'pin'
      ? await SecureStore.getItemAsync(`wallet-${id}`)
      : await SecureStore.getItemAsync(`wallet-biometrics-${id}`, {
          ...defaultBiometricsConfig,
          authenticationPrompt: `Please authenticate to unlock "${name}"`
        })

  if (!mnemonic) throw `Could not find mnemonic for wallet with ID ${id}`

  return {
    name,
    mnemonic,
    authType,
    metadataId: id,
    isMnemonicBackedUp
  } as ActiveWalletState
}

export const getStoredActiveWallet = async (usePin?: boolean): Promise<ActiveWalletState | null> => {
  const id = await AsyncStorage.getItem('active-wallet-id')

  return id ? await getStoredWalletById(id, usePin) : null
}

export const getActiveWalletMetadata = async (): Promise<WalletMetadata | undefined> => {
  const id = await AsyncStorage.getItem('active-wallet-id')

  if (!id) return

  return await getWalletMetadataById(id)
}

export const deleteWalletById = async (id: string) => {
  const walletsMetadata = await getWalletsMetadata()
  const index = walletsMetadata.findIndex((data: WalletMetadata) => data.id === id)

  if (index < 0) throw `Could not find wallet with ID ${id}`

  const walletMetadata = walletsMetadata[index]

  walletsMetadata.splice(index, 1)
  await persistWalletsMetadata(walletsMetadata)

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

  console.log('🗑️ Deleting wallets-metadata')
  await AsyncStorage.removeItem('wallets-metadata')
  console.log('🗑️ Deleting active-wallet-id')
  await AsyncStorage.removeItem('active-wallet-id')
}

const deleteWallet = async ({ id, name, authType }: WalletMetadata) => {
  if (authType === 'biometrics') {
    await deleteBiometricsEnabledMnemonic(id, name)
  }

  console.log(`🗑️ Deleting pin-encrypted mnemonic for wallet with ID ${id}`)
  await SecureStore.deleteItemAsync(`wallet-${id}`)
}

export const areThereOtherWallets = async (): Promise<boolean> => {
  const rawWalletsMetadata = await AsyncStorage.getItem('wallets-metadata')
  if (!rawWalletsMetadata) return false

  const walletsMetadata = JSON.parse(rawWalletsMetadata) as WalletMetadata[]

  return Array.isArray(walletsMetadata) && walletsMetadata.length > 0
}

const getWalletMetadataById = async (id: string): Promise<WalletMetadata> => {
  const walletsMetadata = await getWalletsMetadata()

  const metadata = walletsMetadata.find((wallet: WalletMetadata) => wallet.id === id)

  if (!metadata) throw `Could not find wallet with ID ${id}`

  return metadata
}

export const persistWalletMetadata = async (id: string, partialMetadata: Partial<WalletMetadata>) => {
  const walletsMetadata = await getWalletsMetadata()
  const index = walletsMetadata.findIndex((wallet: WalletMetadata) => wallet.id === id)

  if (index < 0) throw `Could not find wallet with ID ${id}`

  const updatedWalletMetadata = { ...walletsMetadata[index], ...partialMetadata }
  walletsMetadata.splice(index, 1, updatedWalletMetadata)

  await persistWalletsMetadata(walletsMetadata)
}

export const persistAddressesMetadata = async (walletId: string, addressesMetadata: AddressMetadata[]) => {
  const walletsMetadata = await getWalletsMetadata()
  const walletIndex = walletsMetadata.findIndex((wallet: WalletMetadata) => wallet.id === walletId)

  if (walletIndex < 0) throw `Could not find wallet with ID ${walletId}`

  const walletMetadata = walletsMetadata[walletIndex]

  for (const metadata of addressesMetadata) {
    const addressIndex = walletMetadata.addresses.findIndex((data) => data.index === metadata.index)

    if (addressIndex >= 0) {
      walletMetadata.addresses.splice(addressIndex, 1, metadata)
    } else {
      walletMetadata.addresses.push(metadata)
    }

    console.log(`💽 Storing address index ${metadata.index} metadata in persistent storage`)
  }

  walletsMetadata.splice(walletIndex, 1, walletMetadata)
  await persistWalletsMetadata(walletsMetadata)
}

export const getAddressesMetadataByWalletId = async (id: string): Promise<AddressMetadata[]> => {
  const walletMetadata = await getWalletMetadataById(id)

  return walletMetadata.addresses
}

export const getWalletsMetadata = async (): Promise<WalletMetadata[]> => {
  const rawWalletsMetadata = await AsyncStorage.getItem('wallets-metadata')

  return rawWalletsMetadata ? JSON.parse(rawWalletsMetadata) : []
}

export const rememberActiveWallet = async (walletId: string) => {
  console.log(`💽 Updating active-wallet-id to ${walletId}`)
  await AsyncStorage.setItem('active-wallet-id', walletId)
}

export const persistWalletsMetadata = async (walletsMetadata: WalletMetadata[]) => {
  console.log('💽 Updating wallets-metadata')
  await AsyncStorage.setItem('wallets-metadata', JSON.stringify(walletsMetadata))
}

const deleteBiometricsEnabledMnemonic = async (id: string, name: string) => {
  console.log(`🗑️ Deleting biometrics-enabled mnemonic for wallet with ID ${id}`)
  await SecureStore.deleteItemAsync(`wallet-biometrics-${id}`, {
    ...defaultBiometricsConfig,
    authenticationPrompt: `Please, authenticate to delete the wallet "${name}"`
  })
}

export const deriveWalletStoredAddresses = async (wallet: ActiveWalletState): Promise<AddressPartial[]> => {
  const { masterKey } = await walletImportAsyncUnsafe(mnemonicToSeed, wallet.mnemonic)
  const addressesMetadata = await getAddressesMetadataByWalletId(wallet.metadataId)

  console.log(`👀 Found ${addressesMetadata.length} addresses metadata in persistent storage`)

  return addressesMetadata.map(({ index, ...settings }) => ({
    ...deriveAddressAndKeys(masterKey, index),
    settings
  }))
}
