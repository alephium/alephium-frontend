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

interface WalletIdEntry {
  id: string
  name: string
}

export const storeEncryptedWallet = async (walletName: string, encryptedWallet: string) => {
  let id: string
  let walletIds = []

  const rawWalletIds = await AsyncStorage.getItem('wallet-ids')

  if (!rawWalletIds) {
    id = nanoid()

    await AsyncStorage.setItem(
      'wallet-ids',
      JSON.stringify([
        {
          id,
          name: walletName
        }
      ])
    )
  } else {
    walletIds = JSON.parse(rawWalletIds)
    const wallet = walletIds.find((wallet: WalletIdEntry) => wallet.name === walletName)

    if (wallet) {
      id = wallet.id
    } else {
      id = nanoid()

      walletIds.push({
        id,
        name: walletName
      })

      await AsyncStorage.setItem('wallet-ids', JSON.stringify(walletIds))
    }
  }

  await SecureStore.setItemAsync(`wallet-${id}`, encryptedWallet)
  await AsyncStorage.setItem('active-wallet-id', id)
}

export type ActiveEncryptedWallet = {
  name: string
  encryptedWallet: string
}

export const getActiveEncryptedWallet = async (): Promise<ActiveEncryptedWallet | null> => {
  const id = await AsyncStorage.getItem('active-wallet-id')

  if (!id) return null

  const rawWalletIds = await AsyncStorage.getItem('wallet-ids')

  if (!rawWalletIds) throw 'No wallets found'

  const walletIds = JSON.parse(rawWalletIds)

  const { name } = walletIds.find((wallet: WalletIdEntry) => wallet.id === id)
  const encryptedWallet = await SecureStore.getItemAsync(`wallet-${id}`)

  if (!encryptedWallet) throw 'Could not find encrypted wallet'

  return {
    name,
    encryptedWallet
  }
}

export const deleteEncryptedWallet = async (walletName: string) => {
  const rawWalletIds = await AsyncStorage.getItem('wallet-ids')

  if (!rawWalletIds) throw 'No wallets found'

  const walletIds = JSON.parse(rawWalletIds)
  const wallet = walletIds.find((wallet: WalletIdEntry) => wallet.name === walletName)

  if (!wallet) throw 'Could not find wallet'

  walletIds.splice(
    walletIds.findIndex((w: WalletIdEntry) => w.name === walletName),
    1
  )
  await AsyncStorage.setItem('wallet-ids', JSON.stringify(walletIds))
  await SecureStore.deleteItemAsync(`wallet-${wallet.id}`)
}
