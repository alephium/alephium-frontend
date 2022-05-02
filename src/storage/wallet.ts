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

import { Wallet, walletGenerate, walletImport } from '@alephium/sdk'
import * as SecureStore from 'expo-secure-store'

const STORAGE_KEY_SUFFIX = 'wallet'

export const createAndStoreWallet = async (name: string, pin: string, seed?: string): Promise<Wallet> => {
  return new Promise((resolve) => {
    try {
      const wallet = seed ? walletImport(seed) : walletGenerate()

      const encryptedWallet = wallet.encrypt(pin.toString())
      // TODO: Remove accountName from the key and use an index instead
      SecureStore.setItemAsync(`${name.replaceAll(' ', '-')}-${STORAGE_KEY_SUFFIX}`, encryptedWallet).then(() =>
        resolve(wallet)
      )
    } catch (e) {
      console.error(e, 'Error while creating wallet')
    }
  })
}
