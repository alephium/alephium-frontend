import { keyring } from '@alephium/keyring'
import { newWalletInitialAddressGenerated } from '@alephium/shared'

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

const INITIAL_ADDRESS_KEY_TYPE = 'gl-secp256k1'
const INITIAL_ADDRESS_INDEX = 0

export const saveNewWallet = ({ walletName, encrypted }: SaveNewWalletProps): StoredEncryptedWallet['id'] => {
  let storedWallet

  try {
    storedWallet = walletStorage.store(walletName, encrypted)
  } catch {
    throw new Error('Could not store new wallet')
  }

  const initialAddressSettings = getInitialAddressSettings()

  try {
    const address = keyring.generateAndCacheAddress({
      addressIndex: INITIAL_ADDRESS_INDEX,
      keyType: INITIAL_ADDRESS_KEY_TYPE
    })
    const initialAddress = { ...address, ...initialAddressSettings }

    store.dispatch(newWalletInitialAddressGenerated(initialAddress))
    store.dispatch(walletSaved(storedWallet))
  } catch {
    throw new Error('Could not generate initial address while saving new wallet')
  }

  addressMetadataStorage.storeOne(storedWallet.id, {
    index: INITIAL_ADDRESS_INDEX,
    keyType: INITIAL_ADDRESS_KEY_TYPE,
    settings: initialAddressSettings
  })

  return storedWallet.id
}
