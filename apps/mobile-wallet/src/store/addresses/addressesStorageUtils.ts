import { keyring } from '@alephium/keyring'
import { AddressMetadata } from '@alephium/shared'

import { initializeKeyringWithStoredWallet } from '~/persistent-storage/wallet'
import { syncLatestTransactions } from '~/store/addresses/addressesActions'
import { newAddressGenerated } from '~/store/addressesSlice'
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

    store.dispatch(syncLatestTransactions({ addresses: addressHashes, areAddressesNew: true }))
  } finally {
    keyring.clear()
  }
}
