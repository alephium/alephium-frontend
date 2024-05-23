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

import { keyring } from '@alephium/keyring'
import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'
import * as SecureStore from 'expo-secure-store'

import { defaultSecureStoreConfig } from '~/persistent-storage/config'
import {
  deleteWallet,
  getStoredWallet,
  migrateDeprecatedMnemonic,
  storeWalletMetadata,
  storeWalletMetadataDeprecated
} from '~/persistent-storage/wallet'

jest.mock('expo-secure-store')

const mockedDeleteItemAsync = <jest.MockedFunction<typeof SecureStore.deleteItemAsync>>SecureStore.deleteItemAsync
const mockedSetItemAsync = <jest.MockedFunction<typeof SecureStore.setItemAsync>>SecureStore.setItemAsync

const testWalletMnemonic =
  'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'
const testWalletMnemonicStored =
  '{"0":142,"1":7,"2":46,"3":0,"4":237,"5":5,"6":68,"7":4,"8":229,"9":7,"10":99,"11":5,"12":164,"13":7,"14":190,"15":6,"16":35,"17":3,"18":204,"19":2,"20":201,"21":5,"22":56,"23":0,"24":154,"25":7,"26":110,"27":2,"28":234,"29":5,"30":22,"31":3,"32":81,"33":5,"34":10,"35":6,"36":111,"37":2,"38":197,"39":3,"40":89,"41":2,"42":163,"43":5,"44":76,"45":0,"46":238,"47":3}'

const addDeprecatedTestWalletInStorage = () =>
  storeWalletMetadataDeprecated({
    id: '0',
    name: 'Test wallet',
    isMnemonicBackedUp: false,
    addresses: [
      {
        index: 0,
        color: 'red',
        isDefault: true,
        label: 'Main'
      },
      {
        index: 4,
        color: 'blue',
        isDefault: false,
        label: 'Secondary'
      }
    ],
    contacts: []
  })

const addTestWalletInStorage = () =>
  storeWalletMetadata({
    id: '0',
    name: 'Test wallet',
    isMnemonicBackedUp: false,
    addresses: [
      {
        index: 0,
        hash: '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH',
        color: 'red',
        isDefault: true,
        label: 'Main'
      },
      {
        index: 4,
        hash: '1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf',
        color: 'blue',
        isDefault: false,
        label: 'Secondary'
      }
    ],
    contacts: []
  })

afterEach(() => {
  AsyncStorage.clear()
  mockedDeleteItemAsync.mockReset()
  mockedSetItemAsync.mockReset()
})

describe(getStoredWallet, () => {
  it('should fail if there are no wallet metadata stored', async () => {
    expect(getStoredWallet).rejects.toThrow()

    await addTestWalletInStorage()
    const wallet = await getStoredWallet()

    expect(wallet.name).toEqual('Test wallet')
  })
})

describe(migrateDeprecatedMnemonic, () => {
  it('should throw an error if there is no wallet metadata stored', async () => {
    await expect(() => migrateDeprecatedMnemonic(testWalletMnemonic)).rejects.toThrow()
  })

  it('should migrate mnemonic and delete old entries', async () => {
    await addDeprecatedTestWalletInStorage()
    await migrateDeprecatedMnemonic(testWalletMnemonic)

    expect(mockedSetItemAsync).toHaveBeenCalledWith(
      'wallet-mnemonic-v2',
      testWalletMnemonicStored,
      defaultSecureStoreConfig
    )
    expect(mockedDeleteItemAsync).toHaveBeenCalledTimes(2)
  })

  it('should migrate mnemonic even if there is no wallet metadata stored', async () => {
    expect(keyring['root']).toBeNull()

    await expect(() => migrateDeprecatedMnemonic(testWalletMnemonic)).rejects.toThrow()
    expect(mockedSetItemAsync).toHaveBeenCalledWith(
      'wallet-mnemonic-v2',
      testWalletMnemonicStored,
      defaultSecureStoreConfig
    )
    expect(mockedDeleteItemAsync).toHaveBeenCalledTimes(2)
  })

  it('should clear secrets after migrating successfully', async () => {
    expect(keyring['root']).toBeNull()

    await addDeprecatedTestWalletInStorage()
    await migrateDeprecatedMnemonic(testWalletMnemonic)

    expect(keyring['root']).toBeNull()
  })

  it('should clear secrets even when there is an error', async () => {
    expect(keyring['root']).toBeNull()

    await expect(() => migrateDeprecatedMnemonic(testWalletMnemonic)).rejects.toThrow()

    expect(keyring['root']).toBeNull()
  })

  it('should store public and private key in secure store', async () => {
    expect(keyring['root']).toBeNull()

    await addDeprecatedTestWalletInStorage()
    await migrateDeprecatedMnemonic(testWalletMnemonic)

    expect(mockedSetItemAsync).toHaveBeenCalledTimes(5)
    expect(mockedSetItemAsync).toHaveBeenCalledWith(
      'wallet-mnemonic-v2',
      testWalletMnemonicStored,
      defaultSecureStoreConfig
    )
    expect(mockedSetItemAsync).toHaveBeenCalledWith(
      'address-pub-key-1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH',
      '0381818e63bd9e35a5489b52a430accefc608fd60aa2c7c0d1b393b5239aedf6b0',
      defaultSecureStoreConfig
    )
    expect(mockedSetItemAsync).toHaveBeenCalledWith(
      'address-pub-key-1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf',
      '03cc2d92123def7c72bd4dd8ec1c6c41ea1fbeceac0b33dbffb42777f0ca3ea4d8',
      defaultSecureStoreConfig
    )
    expect(mockedSetItemAsync).toHaveBeenCalledWith(
      'address-priv-key-1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH',
      'a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5',
      defaultSecureStoreConfig
    )
    expect(mockedSetItemAsync).toHaveBeenCalledWith(
      'address-priv-key-1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf',
      '053b33e3330b4e9b6636d3062e332f47bf700104a4e18cbeb16efd2ae7cbbae1',
      defaultSecureStoreConfig
    )
  })

  it('should add hash in address metadata', async () => {
    expect(keyring['root']).toBeNull()

    await addDeprecatedTestWalletInStorage()
    await migrateDeprecatedMnemonic(testWalletMnemonic)
    const wallet = await getStoredWallet()

    expect(wallet.addresses[0].hash).toEqual('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
    expect(wallet.addresses[1].hash).toEqual('1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf')
  })
})

describe(deleteWallet, () => {
  it('should delete all wallet entries', async () => {
    await addTestWalletInStorage()
    await deleteWallet()

    expect(mockedDeleteItemAsync).toHaveBeenCalledTimes(6)
    expect(mockedDeleteItemAsync).toHaveBeenCalledWith('wallet-mnemonic-v2', defaultSecureStoreConfig)
    expect(mockedDeleteItemAsync).toHaveBeenCalledWith(
      'address-pub-key-1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH',
      defaultSecureStoreConfig
    )
    expect(mockedDeleteItemAsync).toHaveBeenCalledWith(
      'address-pub-key-1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf',
      defaultSecureStoreConfig
    )
    expect(mockedDeleteItemAsync).toHaveBeenCalledWith(
      'address-priv-key-1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH',
      defaultSecureStoreConfig
    )
    expect(mockedDeleteItemAsync).toHaveBeenCalledWith(
      'address-priv-key-1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf',
      defaultSecureStoreConfig
    )

    expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(2)
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('wallet-metadata')
  })
})
