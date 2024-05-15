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

import { keyring } from '@alephium/keyring'
import { AddressMetadata, getHumanReadableError } from '@alephium/shared'

import { initializeKeyringWithStoredWallet } from '~/persistent-storage/wallet'
import { newAddressGenerated, syncLatestTransactions } from '~/store/addressesSlice'
import { store } from '~/store/store'
import { WalletMetadata } from '~/types/wallet'
import { persistAddressesSettings } from '~/utils/addresses'

export const importAddresses = async (walletId: WalletMetadata['id'], addressesMetadata: AddressMetadata[]) => {
  const addressHashes = []

  try {
    await initializeKeyringWithStoredWallet()

    for (const { index, label, color, isDefault } of addressesMetadata) {
      const newAddressData = keyring.generateAndCacheAddress({ addressIndex: index })
      const newAddress = { ...newAddressData, settings: { label, color, isDefault } }

      await persistAddressesSettings([newAddress], walletId)
      store.dispatch(newAddressGenerated(newAddress))

      addressHashes.push(newAddress.hash)
    }

    store.dispatch(syncLatestTransactions(addressHashes))
  } catch (e) {
    throw new Error(getHumanReadableError(e, ''))
  } finally {
    keyring.clear()
  }
}
