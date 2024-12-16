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

import {
  dangerouslyConvertUint8ArrayMnemonicToString,
  keyring,
  mnemonicJsonStringifiedObjectToUint8Array
} from '@alephium/keyring'
import { AddressHash, AddressMetadata, resetArray } from '@alephium/shared'
import * as SecureStore from 'expo-secure-store'
import { nanoid } from 'nanoid'
import { Alert } from 'react-native'

import { sendAnalytics } from '~/analytics'
import { deleteFundPassword } from '~/features/fund-password/fundPasswordStorage'
import i18n from '~/features/localization/i18n'
import { wasAppUninstalled } from '~/persistent-storage/app'
import { defaultBiometricsConfig } from '~/persistent-storage/config'
import { loadBiometricsSettings } from '~/persistent-storage/settings'
import {
  deleteSecurelyWithReportableError,
  deleteWithReportableError,
  getSecurelyWithReportableError,
  getWithReportableError,
  storeSecurelyWithReportableError,
  storeWithReportableError
} from '~/persistent-storage/utils'
import { AddressMetadataWithHash } from '~/types/addresses'
import {
  DeprecatedWalletMetadata,
  DeprecatedWalletState,
  GeneratedWallet,
  WalletMetadata,
  WalletStoredState
} from '~/types/wallet'
import { getRandomLabelColor } from '~/utils/colors'
import { showToast } from '~/utils/layout'

const PIN_WALLET_STORAGE_KEY = 'wallet-pin'
const BIOMETRICS_WALLET_STORAGE_KEY = 'wallet-biometrics'
const WALLET_METADATA_STORAGE_KEY = 'wallet-metadata'
const IS_NEW_WALLET = 'is-new-wallet'
const MNEMONIC_V2 = 'wallet-mnemonic-v2'
const ADDRESS_PUB_KEY_PREFIX = 'address-pub-key-'
const ADDRESS_PRIV_KEY_PREFIX = 'address-priv-key-'

export const validateAndRepareStoredWalletData = async (
  onUserConfirm: (userChoseYes: boolean) => void
): Promise<'valid' | 'invalid' | 'awaiting-user-confirmation'> => {
  let walletMetadata = await getWalletMetadata(false)
  let mnemonicV2Exists
  let appWasUninstalled

  try {
    mnemonicV2Exists = await storedMnemonicV2Exists()
  } catch {
    mnemonicV2Exists = false
  }

  try {
    appWasUninstalled = await wasAppUninstalled()
  } catch {
    appWasUninstalled = false
  }

  if (mnemonicV2Exists) {
    if (walletMetadata) {
      if (!isStoredWalletMetadataMigrated(walletMetadata)) {
        await migrateAddressMetadata()
      }

      // If we have both mnemonic and metadata available, then all good
      return 'valid'
    } else {
      // If we have mnemonic but missing metadata, we try to recreate them with sane defaults
      Alert.alert(
        i18n.t('Restore data'),
        i18n.t(
          appWasUninstalled
            ? 'We noticed that you deleted the app, would you like to restore your last wallet?'
            : "Due to an unexpected error some of your app's data are missing. Would you like to regenerate them? Your funds are safe."
        ),
        [
          {
            text: i18n.t('No'),
            onPress: () => onUserConfirm(false)
          },
          {
            text: i18n.t('Yes'),
            onPress: async () => {
              try {
                await generateAndStoreWalletMetadata('My wallet', false)
              } catch (error) {
                if (__DEV__) console.error(error)
              } finally {
                walletMetadata = await getWalletMetadata(false)
              }

              if (walletMetadata) {
                showToast({
                  text1: i18n.t('App data were reset'),
                  type: 'success'
                })
                sendAnalytics({ event: 'Recreated missing wallet metadata for existing wallet' })

                onUserConfirm(true)
              } else {
                showToast({
                  text1: i18n.t('Could not unlock app'),
                  text2: i18n.t('Wallet metadata not found'),
                  type: 'error',
                  autoHide: false
                })
                sendAnalytics({
                  type: 'error',
                  message: 'Could not recreate missing wallet metadata for existing wallet'
                })
              }
            }
          }
        ]
      )

      return 'awaiting-user-confirmation'
    }
  } else {
    let deprecatedWalletExists

    try {
      deprecatedWalletExists = !!(await getSecurelyWithReportableError(PIN_WALLET_STORAGE_KEY, true, ''))
    } catch {
      deprecatedWalletExists = false
    }

    if (deprecatedWalletExists) {
      if (walletMetadata) {
        // If we have no mnemonic, but we have a deprecated one with metadata, all good, the pin/bio flow will migrate
        return 'valid'
      } else {
        // If we only have a deprecated mnemonic but no metadata we recreate deprecated metadata with sane defaults and
        // the migration flow will migrate both mnemonic and metadata
        try {
          await storeWalletMetadataDeprecated({
            id: nanoid(),
            name: 'My wallet',
            isMnemonicBackedUp: false,
            addresses: [
              {
                index: 0,
                isDefault: true,
                color: getRandomLabelColor()
              }
            ],
            contacts: []
          })

          return 'valid'
        } catch {
          return 'invalid'
        }
      }
    } else {
      if (!walletMetadata) {
        // If we have no mnemonic, no deprecated mnemonic, and no metadata, all good, fresh install
        return 'valid'
      } else {
        // If we have metadata but no mnemonic and no deprecated mnemonic, we should delete the metadata
        try {
          await deleteWithReportableError(WALLET_METADATA_STORAGE_KEY)
        } finally {
          walletMetadata = await getWalletMetadata(false)
        }

        if (!walletMetadata) {
          return 'valid'
        } else {
          // This should never happen. Could not delete metadata and we don't have any mnemonic, we can't unlock
          showToast({
            text1: i18n.t('Could not unlock app'),
            text2: i18n.t('Missing encrypted mnemonic'),
            type: 'error',
            autoHide: false
          })
          sendAnalytics({ type: 'error', message: 'Could not find mnemonic for existing wallet metadata' })

          return 'invalid'
        }
      }
    }
  }
}

export const generateAndStoreWallet = async (
  name: WalletStoredState['name'],
  mnemonicToImport?: string
): Promise<GeneratedWallet> => {
  const isMnemonicBackedUp = !!mnemonicToImport

  try {
    const mnemonicUint8Array = mnemonicToImport
      ? keyring.importMnemonicString(mnemonicToImport)
      : keyring.generateRandomMnemonic()

    await storeWalletMnemonic(mnemonicUint8Array)

    const { id, firstAddressHash } = await generateAndStoreWalletMetadata(name, isMnemonicBackedUp)

    return {
      id,
      name,
      isMnemonicBackedUp,
      firstAddress: {
        index: 0,
        hash: firstAddressHash
      }
    }
  } finally {
    keyring.clear()
  }
}

const generateAndStoreWalletMetadata = async (name: WalletStoredState['name'], isMnemonicBackedUp: boolean) => {
  const firstAddressHash = await generateAndStoreAddressKeypairForIndex(0)
  const walletMetadata = generateWalletMetadata(name, firstAddressHash, isMnemonicBackedUp)
  await storeWalletMetadata(walletMetadata)

  return {
    id: walletMetadata.id,
    firstAddressHash
  }
}

export const getWalletMetadata = async (
  throwError = true
): Promise<WalletMetadata | DeprecatedWalletMetadata | null> => {
  let rawWalletMetadata
  let walletMetadata = null

  try {
    rawWalletMetadata = await getWithReportableError(WALLET_METADATA_STORAGE_KEY)
  } catch (error) {
    if (throwError) throw error
  }

  if (rawWalletMetadata) {
    try {
      walletMetadata = JSON.parse(rawWalletMetadata)
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Could not parse wallet metadata' })
      if (throwError) throw error
    }
  }

  return walletMetadata
}

// TODO: Simplify getStoredWalletMetadata and getWalletMetadata that are very similar
export const getStoredWalletMetadata = async (error?: string): Promise<WalletMetadata | DeprecatedWalletMetadata> => {
  const walletMetadata = await getWalletMetadata()

  if (!walletMetadata)
    throw new Error(error || `${i18n.t('Could not get stored wallet')}: ${i18n.t('Wallet metadata not found')}`)

  return walletMetadata
}

export const isStoredWalletMetadataMigrated = (
  metadata: WalletMetadata | DeprecatedWalletMetadata
): metadata is WalletMetadata => (metadata as WalletMetadata).addresses.every(addressMetadataIncludesHash)

export const addressMetadataIncludesHash = (
  metadata: AddressMetadata | AddressMetadataWithHash
): metadata is AddressMetadataWithHash => (metadata as AddressMetadataWithHash).hash !== undefined

export const getStoredWalletMetadataWithoutThrowingError = () => getWalletMetadata(false)

export const updateStoredWalletMetadata = async (partialMetadata: Partial<WalletMetadata>) => {
  const walletMetadata = await getStoredWalletMetadata(
    i18n.t('Could not persist wallet metadata: No entry found in storage')
  )
  const updatedWalletMetadata = { ...walletMetadata, ...partialMetadata }

  await storeWalletMetadata(updatedWalletMetadata)
}

export interface GetDeprecatedStoredWalletProps {
  forcePinUsage?: boolean
  authenticationPrompt?: SecureStore.SecureStoreOptions['authenticationPrompt']
}

export const getDeprecatedStoredWallet = async (
  props?: GetDeprecatedStoredWalletProps
): Promise<DeprecatedWalletState | null> => {
  const metadata = await getWalletMetadata()

  if (!metadata) {
    return null
  }

  const { id, name, isMnemonicBackedUp } = metadata
  const { biometricsRequiredForAppAccess } = await loadBiometricsSettings()

  let mnemonic: string | null = null

  if (!props?.forcePinUsage && biometricsRequiredForAppAccess) {
    mnemonic = await SecureStore.getItemAsync(
      BIOMETRICS_WALLET_STORAGE_KEY,
      props?.authenticationPrompt
        ? {
            ...defaultBiometricsConfig,
            authenticationPrompt: props.authenticationPrompt
          }
        : defaultBiometricsConfig
    )
  }

  if (!mnemonic) {
    mnemonic = await getSecurelyWithReportableError(PIN_WALLET_STORAGE_KEY, true, '')
  }

  return mnemonic
    ? ({
        id,
        name,
        mnemonic,
        isMnemonicBackedUp
      } as DeprecatedWalletState)
    : null
}

export const deleteWallet = async () => {
  const wallet = await getStoredWalletMetadata()

  for (const address of wallet.addresses) {
    if (addressMetadataIncludesHash(address)) {
      await deleteAddressKeyPair(address.hash)
    }
  }

  await deleteSecurelyWithReportableError(MNEMONIC_V2, true, '')
  await deleteFundPassword()
  await deleteWithReportableError(WALLET_METADATA_STORAGE_KEY)
  await deleteWithReportableError(IS_NEW_WALLET)
}

export const deleteAddress = async (addressHash: AddressHash) => {
  const wallet = await getStoredWalletMetadata()

  const addressIndex = wallet.addresses.findIndex(
    (address) => addressMetadataIncludesHash(address) && address.hash === addressHash
  )

  if (addressIndex >= 0) {
    wallet.addresses.splice(addressIndex, 1)
    await deleteAddressKeyPair(addressHash)
  }

  await storeWalletMetadata(wallet)
}

const deleteAddressKeyPair = async (addressHash: AddressHash) => {
  await deleteAddressPublicKey(addressHash)
  await deleteAddressPrivateKey(addressHash)
}

export const persistAddressesMetadata = async (walletId: string, addressesMetadata: AddressMetadataWithHash[]) => {
  const walletMetadata = await getStoredWalletMetadata(
    `${i18n.t('Could not persist addresses metadata')}: ${i18n.t('Wallet metadata not found')}`
  )

  for (const metadata of addressesMetadata) {
    const addressIndex = walletMetadata.addresses.findIndex((data) => data.index === metadata.index)

    if (addressIndex >= 0) {
      walletMetadata.addresses.splice(addressIndex, 1, metadata)
    } else {
      walletMetadata.addresses.push(metadata)
    }

    console.log(`💽 Storing address index ${metadata.index} metadata in persistent storage`)
  }

  await storeWalletMetadata(walletMetadata)
}

export const getIsNewWallet = async (): Promise<boolean | undefined> =>
  (await getWithReportableError(IS_NEW_WALLET)) === 'true'

export const storeIsNewWallet = async (isNew: boolean) => storeWithReportableError(IS_NEW_WALLET, isNew.toString())

export const deleteDeprecatedWallet = async () => {
  await deleteSecurelyWithReportableError(PIN_WALLET_STORAGE_KEY, true, '')

  try {
    await SecureStore.deleteItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, defaultBiometricsConfig)
  } catch (error) {
    sendAnalytics({ type: 'error', message: `Could not delete ${BIOMETRICS_WALLET_STORAGE_KEY} from secure storage` })
    throw error
  }
}

export const migrateDeprecatedMnemonic = async (deprecatedMnemonic: string) => {
  // Step 1: Store mnemonic as Uint8Array in secure store without authentication required (as per Uniswap)
  const mnemonicUint8Array = keyring.importMnemonicString(deprecatedMnemonic)

  try {
    await storeWalletMnemonic(mnemonicUint8Array)

    // Step 2: Delete old mnemonic records
    await deleteDeprecatedWallet()

    // Step 3: Add hash in address metadata for faster app unlock and store public and private key in secure store
    await migrateAddressMetadata()
  } finally {
    keyring.clear()
  }
}

export const migrateAddressMetadata = async () => {
  try {
    if (!keyring.isInitialized()) await initializeKeyringWithStoredWallet()

    const { addresses } = await getStoredWalletMetadata(
      `${i18n.t('Could not migrate address metadata')}: ${i18n.t('Wallet metadata not found')}`
    )
    const updatedAddressesMetadata: AddressMetadataWithHash[] = []

    for (const address of addresses) {
      const { hash, publicKey } = keyring.generateAndCacheAddress({ addressIndex: address.index })
      let privateKey = keyring.exportPrivateKeyOfAddress(hash)

      await storeAddressPublicKey(hash, publicKey)
      await storeAddressPrivateKey(hash, privateKey)

      privateKey = ''

      updatedAddressesMetadata.push({
        ...address,
        hash
      })
    }

    await updateStoredWalletMetadata({ addresses: updatedAddressesMetadata })
  } finally {
    keyring.clear()
  }
}

export const storedWalletExists = async (): Promise<boolean> => {
  const mnemonicExists = await storedMnemonicV2Exists()
  const metadataExist = await storedWalletMetadataExist()

  return mnemonicExists && metadataExist
}

export const storedMnemonicV2Exists = async (): Promise<boolean> =>
  !!(await getSecurelyWithReportableError(MNEMONIC_V2, true, ''))

const storedWalletMetadataExist = async (): Promise<boolean> => !!(await getWalletMetadata())

export const dangerouslyExportWalletMnemonic = async (): Promise<string> => {
  const decryptedMnemonic = await getSecurelyWithReportableError(MNEMONIC_V2, true, '')

  if (!decryptedMnemonic)
    throw new Error(`${i18n.t('Could not export mnemonic')}: ${i18n.t('Could not find stored wallet')}`)

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))

  return dangerouslyConvertUint8ArrayMnemonicToString(parsedDecryptedMnemonic)
}

export const getAddressAsymetricKey = async (addressHash: AddressHash, keyType: 'public' | 'private') => {
  const storageKey = (keyType === 'public' ? ADDRESS_PUB_KEY_PREFIX : ADDRESS_PRIV_KEY_PREFIX) + addressHash
  let key = await getSecurelyWithReportableError(storageKey, false, `Could not get ${keyType} from secure storage`)

  if (!key) {
    const { addresses } = await getStoredWalletMetadata(
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

    await generateAndStoreAddressKeypairForIndex(address.index)
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

const generateWalletMetadata = (name: string, firstAddressHash: string, isMnemonicBackedUp = false) => ({
  id: nanoid(),
  name,
  isMnemonicBackedUp,
  addresses: [
    {
      index: 0,
      hash: firstAddressHash,
      isDefault: true,
      color: getRandomLabelColor()
    }
  ],
  contacts: []
})

export const storeWalletMetadata = async (metadata: WalletMetadata | DeprecatedWalletMetadata) =>
  storeWithReportableError(WALLET_METADATA_STORAGE_KEY, JSON.stringify(metadata))

export const storeWalletMetadataDeprecated = async (metadata: DeprecatedWalletMetadata) =>
  storeWithReportableError(WALLET_METADATA_STORAGE_KEY, JSON.stringify(metadata))

export const storeWalletMnemonic = async (mnemonic: Uint8Array) =>
  storeSecurelyWithReportableError(MNEMONIC_V2, JSON.stringify(mnemonic), true, '')

const storeAddressPublicKey = async (addressHash: AddressHash, publicKey: string) =>
  storeSecurelyWithReportableError(
    ADDRESS_PUB_KEY_PREFIX + addressHash,
    publicKey,
    false,
    'Could not store address public key'
  )

const storeAddressPrivateKey = async (addressHash: AddressHash, privateKey: string) => {
  storeSecurelyWithReportableError(
    ADDRESS_PRIV_KEY_PREFIX + addressHash,
    privateKey,
    false,
    'Could not store address private key'
  )

  privateKey = ''
}

const deleteAddressPublicKey = async (addressHash: AddressHash) =>
  deleteSecurelyWithReportableError(ADDRESS_PUB_KEY_PREFIX + addressHash, false, 'Could not delete address public key')

const deleteAddressPrivateKey = async (addressHash: AddressHash) =>
  deleteSecurelyWithReportableError(
    ADDRESS_PRIV_KEY_PREFIX + addressHash,
    false,
    'Could not delete address private key'
  )

const generateAndStoreAddressKeypairForIndex = async (addressIndex: number): Promise<AddressHash> => {
  try {
    if (!keyring.isInitialized()) await initializeKeyringWithStoredWallet()

    const { hash, publicKey } = keyring.generateAndCacheAddress({ addressIndex })
    let privateKey = keyring.exportPrivateKeyOfAddress(hash)

    await storeAddressPublicKey(hash, publicKey)
    await storeAddressPrivateKey(hash, privateKey)

    privateKey = ''

    return hash
  } finally {
    keyring.clear()
  }
}

export const initializeKeyringWithStoredWallet = async () => {
  let decryptedMnemonic = await getSecurelyWithReportableError(MNEMONIC_V2, true, '')
  if (!decryptedMnemonic)
    throw new Error(`${i18n.t('Could not initialize keyring')}: ${i18n.t('Could not find stored wallet')}`)

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))
  keyring.initFromDecryptedMnemonic(parsedDecryptedMnemonic, '')

  decryptedMnemonic = ''
  resetArray(parsedDecryptedMnemonic)
}
