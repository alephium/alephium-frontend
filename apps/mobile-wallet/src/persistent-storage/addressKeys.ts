import { keyring, NonSensitiveAddressData } from '@alephium/keyring'
import { AddressHash, addressMetadataIncludesHash } from '@alephium/shared'
import { KeyType } from '@alephium/web3'

import i18n from '~/features/localization/i18n'
import {
  deleteSecurelyWithReportableError,
  getSecurelyWithReportableError,
  storeSecurelyWithReportableError
} from '~/persistent-storage/utils'
import { getStoredWalletMetadata, initializeKeyringWithStoredWallet } from '~/persistent-storage/wallet'

const ADDRESS_PUB_KEY_PREFIX = 'address-pub-key-'
const ADDRESS_PRIV_KEY_PREFIX = 'address-priv-key-'

export const getAddressAsymetricKey = async (
  walletId: string,
  addressHash: AddressHash,
  keyType: 'public' | 'private'
) => {
  const storageKey = (keyType === 'public' ? ADDRESS_PUB_KEY_PREFIX : ADDRESS_PRIV_KEY_PREFIX) + addressHash
  let key = await getSecurelyWithReportableError(storageKey, false, `Could not get ${keyType} from secure storage`)

  if (!key) {
    const { addresses } = getStoredWalletMetadata(
      walletId,
      `${i18n.t(
        keyType === 'public' ? 'Could not get address public key' : 'Could not get address private key'
      )}: ${i18n.t('Wallet metadata not found')}`
    )
    const address = addresses.find((address) => addressMetadataIncludesHash(address) && address.hash === addressHash)

    if (!address)
      throw new Error(
        `${i18n.t(
          keyType === 'public' ? 'Could not get address public key' : 'Could not get address private key'
        )}: ${i18n.t('Address metadata not found')}`
      )

    await generateAndStoreAddressKeypairForIndex(walletId, address.index, address.keyType ?? 'default')
    key = await getSecurelyWithReportableError(storageKey, false, `Could not get ${keyType} from secure storage`)

    if (!key)
      throw new Error(
        i18n.t(
          keyType === 'public' ? 'Could not generate address public key' : 'Could not generate address private key'
        )
      )
  }

  return key
}

export const storeAddressPublicKey = async (addressHash: AddressHash, publicKey: string) =>
  storeSecurelyWithReportableError(
    ADDRESS_PUB_KEY_PREFIX + addressHash,
    publicKey,
    false,
    'Could not store address public key'
  )

export const storeAddressPrivateKey = async (addressHash: AddressHash, privateKey: string) => {
  storeSecurelyWithReportableError(
    ADDRESS_PRIV_KEY_PREFIX + addressHash,
    privateKey,
    false,
    'Could not store address private key'
  )

  privateKey = ''
}

export const deleteAddressKeyPair = async (addressHash: AddressHash) => {
  await deleteSecurelyWithReportableError(
    ADDRESS_PUB_KEY_PREFIX + addressHash,
    false,
    'Could not delete address public key'
  )
  await deleteSecurelyWithReportableError(
    ADDRESS_PRIV_KEY_PREFIX + addressHash,
    false,
    'Could not delete address private key'
  )
}

export const generateAndStoreAddressKeypairForIndex = async (
  walletId: string,
  addressIndex: number,
  keyType: KeyType
): Promise<NonSensitiveAddressData> => {
  try {
    if (!keyring.isInitialized()) await initializeKeyringWithStoredWallet(walletId)

    const nonSensitiveAddressData = keyring.generateAndCacheAddress({ addressIndex, keyType })
    let privateKey = keyring.exportPrivateKeyOfAddress(nonSensitiveAddressData.hash)

    await storeAddressPublicKey(nonSensitiveAddressData.hash, nonSensitiveAddressData.publicKey)
    await storeAddressPrivateKey(nonSensitiveAddressData.hash, privateKey)

    privateKey = ''

    return nonSensitiveAddressData
  } finally {
    keyring.clear()
  }
}
