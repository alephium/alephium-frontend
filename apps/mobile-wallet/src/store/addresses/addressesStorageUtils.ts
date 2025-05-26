import { keyring } from '@alephium/keyring'
import { AddressMetadata, newAddressesSaved, WalletMetadataMobile } from '@alephium/shared'

import { initializeKeyringWithStoredWallet } from '~/persistent-storage/wallet'
import { store } from '~/store/store'
import { persistAddressesSettings } from '~/utils/addresses'

export const importAddresses = async (walletId: WalletMetadataMobile['id'], addressesMetadata: AddressMetadata[]) => {
  const addressHashes = []

  try {
    await initializeKeyringWithStoredWallet()

    for (const { index, ...addressMetadata } of addressesMetadata) {
      const newAddressNonSensitiveData = keyring.generateAndCacheAddress({
        addressIndex: index,
        keyType: 'default' // TODO: Support groupless addresses
      })
      const newAddress = { ...newAddressNonSensitiveData, ...addressMetadata }

      await persistAddressesSettings([newAddress], walletId)
      store.dispatch(newAddressesSaved([newAddress]))

      addressHashes.push(newAddress.hash)
    }
  } finally {
    keyring.clear()
  }
}
