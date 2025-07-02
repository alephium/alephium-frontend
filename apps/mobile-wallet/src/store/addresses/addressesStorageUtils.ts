import { keyring } from '@alephium/keyring'
import { AddressStoredMetadataWithoutHash, newAddressesSaved, WalletMetadataMobile } from '@alephium/shared'

import { initializeKeyringWithStoredWallet } from '~/persistent-storage/wallet'
import { store } from '~/store/store'
import { persistAddressesSettings } from '~/utils/addresses'

export const importAddresses = async (
  walletId: WalletMetadataMobile['id'],
  addressesMetadata: AddressStoredMetadataWithoutHash[]
) => {
  const addressHashes = []

  try {
    await initializeKeyringWithStoredWallet()

    for (const { index, keyType, ...addressMetadata } of addressesMetadata) {
      const newAddressNonSensitiveData = keyring.generateAndCacheAddress({
        addressIndex: index,
        keyType: keyType ?? 'default'
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
