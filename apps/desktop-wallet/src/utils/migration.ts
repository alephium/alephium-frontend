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

import { AddressMetadata, Contact, NetworkSettings, networkSettingsPresets } from '@alephium/shared'
import {
  dangerouslyConvertBufferMnemonicToString,
  decrypt,
  decryptMnemonic,
  DecryptMnemonicResult,
  encryptMnemonic,
  ValidEncryptedWalletVersions
} from '@alephium/shared-crypto'
import { merge } from 'lodash'
import { nanoid } from 'nanoid'

import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { contactsStorage } from '@/storage/addresses/contactsPersistentStorage'
import SettingsStorage, { defaultSettings } from '@/storage/settings/settingsPersistentStorage'
import { pendingTransactionsStorage } from '@/storage/transactions/pendingTransactionsPersistentStorage'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'
import { DeprecatedAddressMetadata } from '@/types/addresses'
import { GeneralSettings, ThemeSettings } from '@/types/settings'
import { StoredEncryptedWallet } from '@/types/wallet'
import { getRandomLabelColor } from '@/utils/colors'
import { stringToDoubleSHA256HexString } from '@/utils/misc'

//
// ANY CHANGES TO THIS FILE MUST BE REVIEWED BY AT LEAST ONE CORE CONTRIBUTOR
//
// Arguments are essentially dependencies of the migrations.
// Unfortunately mnemonics are a dependency due to being needed to encrypt address
// metadata, so migration must absolutely occur after login at the earliest.
//
// Future dependencies must be explained as they are added.
//
// ANY MODIFICATIONS MUST HAVE TESTS ADDED TO tests/migration.test.ts!
//

// We first run the migration that do not require authentication, on app launch
export const migrateWalletData = () => {
  console.log('🚚 Migrating wallet data')

  _20220511_074100()
  _20230228_155100()
}

export const migrateGeneralSettings = (): GeneralSettings => {
  console.log('🚚 Migrating settings')

  _20211220_194004()

  return SettingsStorage.load('general') as GeneralSettings
}

export const migrateNetworkSettings = (): NetworkSettings => {
  console.log('🚚 Migrating network settings')

  _v140_networkSettingsMigration()
  _v150_networkSettingsMigration()
  _v153_networkSettingsMigration()
  _v200_networkSettingsMigration()
  _v213_networkSettingsMigration()

  return SettingsStorage.load('network') as NetworkSettings
}

// Then we run user data migrations after the user has authenticated
export const migrateUserData = (
  walletId: StoredEncryptedWallet['id'],
  password: string,
  version: ValidEncryptedWalletVersions
) => {
  console.log('🚚 Migrating user data')

  _20240328_1200_migrateEncryptedWalletFromV1ToV2(walletId, password, version)
  _20240328_1221_migrateAddressAndContactsToUnencrypted(walletId, password)
  _20230209_124300_migrateIsMainToIsDefault(walletId)

  password = ''
}

// Change localStorage address metadata key from "{walletName}-addresses-metadata" to "addresses-metadata-{walletName}"
// See https://github.com/alephium/desktop-wallet/issues/236
export const _20220511_074100 = () => {
  const prefix = 'wallet-'
  const prefixLength = prefix.length
  const addressesMetadataLocalStorageKeyPrefix = 'addresses-metadata-'

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)

    if (key?.startsWith(prefix)) {
      const data = localStorage.getItem(key)

      if (!data) continue

      const walletName = key.substring(prefixLength)
      const keyDeprecated = `${walletName}-addresses-metadata`
      const addressesMetadata = localStorage.getItem(keyDeprecated)

      if (addressesMetadata) {
        const keyNew = `${addressesMetadataLocalStorageKeyPrefix}${walletName}`

        localStorage.setItem(keyNew, addressesMetadata)
        localStorage.removeItem(keyDeprecated)
      }
    }
  }
}

// Remove "theme" from localStorage and add it inside general settings
export const _20211220_194004 = () => {
  const generalSettings = SettingsStorage.load('general') as GeneralSettings
  const deprecatedThemeSetting = window.localStorage.getItem('theme')
  deprecatedThemeSetting && window.localStorage.removeItem('theme')

  const migratedGeneralSettings = deprecatedThemeSetting
    ? { ...generalSettings, theme: deprecatedThemeSetting as ThemeSettings }
    : generalSettings
  const newGeneralSettings = merge({}, defaultSettings.general, migratedGeneralSettings)

  SettingsStorage.store('general', newGeneralSettings)
}

export const _v140_networkSettingsMigration = () =>
  migrateReleaseNetworkSettings({
    'https://mainnet-wallet.alephium.org': networkSettingsPresets.mainnet.nodeHost,
    'https://testnet-wallet.alephium.org': networkSettingsPresets.testnet.nodeHost,
    'https://mainnet-backend.alephium.org': networkSettingsPresets.mainnet.explorerApiHost,
    'https://testnet-backend.alephium.org': networkSettingsPresets.testnet.explorerApiHost,
    'https://testnet.alephium.org': networkSettingsPresets.testnet.explorerUrl
  })

export const _v150_networkSettingsMigration = () =>
  migrateReleaseNetworkSettings({
    'https://wallet-v18.mainnet.alephium.org': networkSettingsPresets.mainnet.nodeHost,
    'https://wallet-v18.testnet.alephium.org': networkSettingsPresets.testnet.nodeHost,
    'https://backend-v18.mainnet.alephium.org': networkSettingsPresets.mainnet.explorerApiHost,
    'https://backend-v18.testnet.alephium.org': networkSettingsPresets.testnet.explorerApiHost,
    'https://explorer-v18.mainnet.alephium.org': networkSettingsPresets.mainnet.explorerUrl,
    'https://explorer-v18.testnet.alephium.org': networkSettingsPresets.testnet.explorerUrl
  })

export const _v153_networkSettingsMigration = () =>
  migrateReleaseNetworkSettings({
    'https://wallet-v16.mainnet.alephium.org': networkSettingsPresets.mainnet.nodeHost,
    'https://wallet-v16.testnet.alephium.org': networkSettingsPresets.testnet.nodeHost,
    'https://backend-v112.mainnet.alephium.org': networkSettingsPresets.mainnet.explorerApiHost,
    'https://backend-v112.testnet.alephium.org': networkSettingsPresets.testnet.explorerApiHost,
    'https://explorer.testnet.alephium.org': networkSettingsPresets.testnet.explorerUrl
  })

export const _v200_networkSettingsMigration = () =>
  migrateReleaseNetworkSettings({
    'https://wallet-v17.mainnet.alephium.org': networkSettingsPresets.mainnet.nodeHost,
    'https://wallet-v17.testnet.alephium.org': networkSettingsPresets.testnet.nodeHost,
    'https://backend-v113.mainnet.alephium.org': networkSettingsPresets.mainnet.explorerApiHost,
    'https://backend-v113.testnet.alephium.org': networkSettingsPresets.testnet.explorerApiHost,
    'https://explorer.testnet.alephium.org': networkSettingsPresets.testnet.explorerUrl
  })

export const _v213_networkSettingsMigration = () =>
  migrateReleaseNetworkSettings({
    'https://wallet-v20.mainnet.alephium.org': networkSettingsPresets.mainnet.nodeHost,
    'https://wallet-v20.testnet.alephium.org': networkSettingsPresets.testnet.nodeHost,
    'https://backend-v113.mainnet.alephium.org': networkSettingsPresets.mainnet.explorerApiHost,
    'https://backend-v113.testnet.alephium.org': networkSettingsPresets.testnet.explorerApiHost,
    'https://explorer.testnet.alephium.org': networkSettingsPresets.testnet.explorerUrl
  })

const migrateReleaseNetworkSettings = (migrationsMapping: Record<string, string>) => {
  const previousSettings = SettingsStorage.load('network') as NetworkSettings
  const { nodeHost, explorerApiHost, explorerUrl } = previousSettings

  const migratedNetworkSettings = {
    ...previousSettings,
    nodeHost: migrationsMapping[nodeHost] ?? nodeHost,
    explorerApiHost: migrationsMapping[explorerApiHost] ?? explorerApiHost,
    explorerUrl: migrationsMapping[explorerUrl] ?? explorerUrl
  }

  const newNetworkSettings = merge({}, defaultSettings.network, migratedNetworkSettings)
  SettingsStorage.store('network', newNetworkSettings)
}

// 1. Generate a unique wallet ID for every wallet entry
// 2. Use wallet ID as key to store wallet and address data, instead of wallet name
// 3. Store wallet ID and wallet name in entry value
export const _20230228_155100 = () => {
  const walletPrefix = 'wallet-'
  const walletPrefixLength = walletPrefix.length
  const addressesMetadataPrefix = 'addresses-metadata-'

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)

    if (key?.startsWith(walletPrefix)) {
      const data = localStorage.getItem(key)

      if (!data) continue

      const nameOrId = key.substring(walletPrefixLength)
      const walletOldKey = `${walletPrefix}${nameOrId}`
      const walletRaw = localStorage.getItem(walletOldKey)

      if (!walletRaw) continue

      const wallet = JSON.parse(walletRaw)

      if (
        typeof wallet === 'string' ||
        (typeof wallet === 'object' &&
          !Object.prototype.hasOwnProperty.call(wallet, 'id') &&
          !Object.prototype.hasOwnProperty.call(wallet, 'name'))
      ) {
        const id = nanoid()
        const name = nameOrId // Since the wallet didn't have a "name" property, we know that the name was used as key
        const newKey = walletStorage.getKey(id)
        const newValue: StoredEncryptedWallet = {
          id,
          name,
          encrypted: typeof wallet === 'string' ? wallet : JSON.stringify(wallet),
          lastUsed: Date.now()
        }

        localStorage.setItem(newKey, JSON.stringify(newValue))
        localStorage.removeItem(walletOldKey)

        const addressMetadataOldKeys = [
          `${addressesMetadataPrefix}${name}`,
          `${addressesMetadataPrefix}${stringToDoubleSHA256HexString(name)}`
        ]

        addressMetadataOldKeys.forEach((oldKey) => {
          const addressesMetadataRaw = localStorage.getItem(oldKey)

          if (addressesMetadataRaw) {
            // Use new wallet ID as key to store address metadata, instead of wallet name

            let addressesMetadata = JSON.parse(addressesMetadataRaw)

            // Rename encryptedSettings property to encrypted
            if (
              typeof addressesMetadata === 'object' &&
              Object.prototype.hasOwnProperty.call(addressesMetadata, 'encryptedSettings')
            ) {
              addressesMetadata = {
                version: addressesMetadata.version,
                encrypted: addressesMetadata.encryptedSettings
              }
            }

            localStorage.setItem(addressMetadataStorage.getKey(id), JSON.stringify(addressesMetadata))
            localStorage.removeItem(oldKey)
          }
        })
      }
    }
  }
}

// Change isMain to isDefault settings of each address and ensure it has a color
export const _20230209_124300_migrateIsMainToIsDefault = (walletId: StoredEncryptedWallet['id']) => {
  const currentAddressMetadata: (AddressMetadata | DeprecatedAddressMetadata)[] = addressMetadataStorage.load(walletId)
  const newAddressesMetadata: AddressMetadata[] = []

  currentAddressMetadata.forEach((currentMetadata: AddressMetadata | DeprecatedAddressMetadata) => {
    let newMetadata: AddressMetadata

    if (Object.prototype.hasOwnProperty.call(currentMetadata, 'isMain')) {
      const { isMain, color, ...rest } = currentMetadata as DeprecatedAddressMetadata
      newMetadata = { ...rest, isDefault: isMain, color: color || getRandomLabelColor() } as AddressMetadata
    } else {
      newMetadata = currentMetadata as AddressMetadata
    }
    newAddressesMetadata.push(newMetadata)
  })

  addressMetadataStorage.store(walletId, newAddressesMetadata)
}

// In version 1 the encrypted mnemonic used to be stored as a string before we started using Buffer. This migrates
// the encrypted wallet from StoredStateV1 to StoredStateV2.
export const _20240328_1200_migrateEncryptedWalletFromV1ToV2 = (
  walletId: StoredEncryptedWallet['id'],
  password: string,
  version: ValidEncryptedWalletVersions
) => {
  try {
    if (version === 1) {
      let decryptedMnemonic: Buffer | null = decryptMnemonic(
        walletStorage.load(walletId).encrypted,
        password
      ).decryptedMnemonic

      walletStorage.update(walletId, { encrypted: encryptMnemonic(decryptedMnemonic, password) })

      console.log('Migrated stored mnemonic from version 1 to version 2')
      decryptedMnemonic = null
    }
  } catch (e) {
    console.error('Failed migrating stored mnemonic from version 1 to version 2', e)
  } finally {
    password = ''
  }
}

// Migrate address metadata and contacts from encrypted to unencrypted
export const _20240328_1221_migrateAddressAndContactsToUnencrypted = (
  walletId: StoredEncryptedWallet['id'],
  password: string
) => {
  const metadataJson = localStorage.getItem(`addresses-metadata-${walletId}`)
  const contactsJson = localStorage.getItem(`contacts-${walletId}`)
  pendingTransactionsStorage.delete(walletId)

  let parsedMetadataJson
  let parsedContactsJson

  try {
    parsedMetadataJson = metadataJson ? JSON.parse(metadataJson) : undefined
  } catch (e) {
    console.error(e)
  }

  try {
    parsedContactsJson = contactsJson ? JSON.parse(contactsJson) : undefined
  } catch (e) {
    console.error(e)
  }

  if (parsedMetadataJson?.encrypted || parsedContactsJson?.encrypted) {
    let result: DecryptMnemonicResult | null

    result = decryptMnemonic(walletStorage.load(walletId).encrypted, password)
    password = ''

    if (result.version !== 2) {
      throw new Error(
        'Migration: Could not migrate address metadata and contacts before first migrating the wallet from v1 to v2'
      )
    }
    if (!result.decryptedMnemonic) throw new Error('Migration: Could not migrate user data, mnemonic is not provided')

    try {
      if (parsedMetadataJson?.encrypted) {
        const metadata = JSON.parse(
          decrypt(dangerouslyConvertBufferMnemonicToString(result.decryptedMnemonic), parsedMetadataJson.encrypted)
        ) as AddressMetadata[]
        addressMetadataStorage.store(walletId, metadata)
      }

      if (parsedContactsJson?.encrypted) {
        const contacts = JSON.parse(
          decrypt(dangerouslyConvertBufferMnemonicToString(result.decryptedMnemonic), parsedContactsJson.encrypted)
        ) as Contact[]
        contactsStorage.store(walletId, contacts)
      }

      result = null
    } catch (e) {
      console.error(e)
    }
  } else {
    password = ''
  }
}
