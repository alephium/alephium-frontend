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

import { syncAddressesData } from '@/storage/addresses/addressesActions'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { store } from '@/storage/store'
import { walletSaved } from '@/storage/wallets/walletActions'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'
import { StoredEncryptedWallet } from '@/types/wallet'
import { getInitialAddressSettings } from '@/utils/addresses'

interface SaveNewWalletProps {
  walletName: string
  encrypted: string
}

export const saveNewWallet = ({ walletName, encrypted }: SaveNewWalletProps): StoredEncryptedWallet['id'] => {
  const storedWallet = walletStorage.store(walletName, encrypted)
  const initialAddressSettings = getInitialAddressSettings()

  store.dispatch(
    walletSaved({
      wallet: storedWallet,
      initialAddress: { ...keyring.generateAndCacheAddress({ addressIndex: 0 }), ...initialAddressSettings }
    })
  )

  addressMetadataStorage.storeOne(storedWallet.id, { index: 0, settings: initialAddressSettings })
  store.dispatch(syncAddressesData())

  return storedWallet.id
}
