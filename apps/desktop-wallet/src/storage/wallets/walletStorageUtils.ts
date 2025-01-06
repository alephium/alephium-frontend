import { keyring } from '@alephium/keyring'

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
  let storedWallet

  try {
    storedWallet = walletStorage.store(walletName, encrypted)
  } catch {
    throw new Error('Could not store new wallet')
  }

  const initialAddressSettings = getInitialAddressSettings()

  try {
    store.dispatch(
      walletSaved({
        wallet: storedWallet,
        initialAddress: { ...keyring.generateAndCacheAddress({ addressIndex: 0 }), ...initialAddressSettings }
      })
    )
  } catch {
    throw new Error('Could not generate initial address while saving new wallet')
  }

  addressMetadataStorage.storeOne(storedWallet.id, { index: 0, settings: initialAddressSettings })

  return storedWallet.id
}
