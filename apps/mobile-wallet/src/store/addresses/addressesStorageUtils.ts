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

    for (const { index, ...addressMetadata } of addressesMetadata) {
      const newAddressNonSensitiveData = keyring.generateAndCacheAddress({ addressIndex: index })
      const newAddress = { ...newAddressNonSensitiveData, ...addressMetadata }

      await persistAddressesSettings([newAddress], walletId)
      store.dispatch(newAddressGenerated(newAddress))

      addressHashes.push(newAddress.hash)
    }

    store.dispatch(syncLatestTransactions({ addresses: addressHashes, areAddressesNew: true }))
  } finally {
    keyring.clear()
  }
}
