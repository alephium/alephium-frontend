import { keyring } from '@alephium/keyring'
import { newAddressesSaved } from '@alephium/shared/store'
import { AddressStoredMetadataWithoutHash, WalletMetadataMobile } from '@alephium/shared/types'

import { initializeKeyringWithStoredWallet } from '~/persistent-storage/walletMnemonic'
import { store } from '~/store/store'
import { persistAddressesSettings } from '~/utils/addresses'

export const importAddresses = async (
  walletId: WalletMetadataMobile['id'],
  addressesMetadata: AddressStoredMetadataWithoutHash[]
) => {
  const addressHashes = []

  try {
    await initializeKeyringWithStoredWallet(walletId)

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
