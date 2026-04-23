import { keyring } from '@alephium/keyring'
import * as SecureStore from 'expo-secure-store'

import { defaultSecureStoreConfig } from '~/persistent-storage/config'
import {
  legacyGetStoredWalletMetadata,
  legacyGetWalletMetadata,
  legacyStoreWalletMetadata,
  migrateDeprecatedMnemonic
} from '~/persistent-storage/legacyWallet'
import { storage } from '~/persistent-storage/storage'
import { deleteWallet } from '~/persistent-storage/wallet'
import { addWalletToList, createWalletListEntry } from '~/persistent-storage/walletList'
import {
  getStoredWalletMetadata,
  isStoredWalletMetadataMigrated,
  storeWalletMetadata
} from '~/persistent-storage/walletMetadata'
import { validateAndRepairStoredWalletData } from '~/persistent-storage/walletValidation'

const testWalletId = '0'

const mockedDeleteItemAsync = vi.mocked(SecureStore.deleteItemAsync)
const mockedSetItemAsync = vi.mocked(SecureStore.setItemAsync)
const mockedGetItemAsync = vi.mocked(SecureStore.getItemAsync)

const testWalletMnemonicString =
  'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'
const testWalletMnemonicStored =
  '{"0":142,"1":7,"2":46,"3":0,"4":237,"5":5,"6":68,"7":4,"8":229,"9":7,"10":99,"11":5,"12":164,"13":7,"14":190,"15":6,"16":35,"17":3,"18":204,"19":2,"20":201,"21":5,"22":56,"23":0,"24":154,"25":7,"26":110,"27":2,"28":234,"29":5,"30":22,"31":3,"32":81,"33":5,"34":10,"35":6,"36":111,"37":2,"38":197,"39":3,"40":89,"41":2,"42":163,"43":5,"44":76,"45":0,"46":238,"47":3}'

// Uses legacy keys (for deprecated/validation tests)
const addDeprecatedTestWalletMetadataInStorage = () =>
  legacyStoreWalletMetadata({
    id: testWalletId,
    name: 'Test wallet',
    isMnemonicBackedUp: false,
    addresses: [
      {
        index: 0,
        keyType: 'default',
        color: 'red',
        isDefault: true,
        label: 'Main'
      },
      {
        index: 4,
        keyType: 'default',
        color: 'blue',
        isDefault: false,
        label: 'Secondary'
      }
    ],
    contacts: []
  })

// Uses wallet-ID-scoped keys (for new multi-wallet tests)
const addTestWalletMetadataInStorage = () => {
  storeWalletMetadata(testWalletId, {
    id: testWalletId,
    name: 'Test wallet',
    type: 'seed',
    isMnemonicBackedUp: false,
    addresses: [
      {
        index: 0,
        keyType: 'default',
        hash: '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH',
        color: 'red',
        isDefault: true,
        label: 'Main'
      },
      {
        index: 4,
        keyType: 'default',
        hash: '1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf',
        color: 'blue',
        isDefault: false,
        label: 'Secondary'
      }
    ],
    contacts: []
  })
  addWalletToList(createWalletListEntry(testWalletId, 'Test wallet', 'seed'))
}

// Uses legacy keys (for validateAndRepair tests)
const addTestWalletMetadataInLegacyStorage = () =>
  legacyStoreWalletMetadata({
    id: testWalletId,
    name: 'Test wallet',
    isMnemonicBackedUp: false,
    addresses: [
      {
        index: 0,
        keyType: 'default',
        hash: '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH',
        color: 'red',
        isDefault: true,
        label: 'Main'
      },
      {
        index: 4,
        keyType: 'default',
        hash: '1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf',
        color: 'blue',
        isDefault: false,
        label: 'Secondary'
      }
    ],
    contacts: []
  })

afterEach(() => {
  storage.clearAll()
  mockedDeleteItemAsync.mockReset()
  mockedSetItemAsync.mockReset()
  mockedGetItemAsync.mockReset()
})

describe(getStoredWalletMetadata, () => {
  it('should fail if there are no wallet metadata stored', () => {
    expect(() => getStoredWalletMetadata(testWalletId)).toThrow()

    addTestWalletMetadataInStorage()
    const wallet = getStoredWalletMetadata(testWalletId)

    expect(wallet.name).toEqual('Test wallet')
  })
})

describe(migrateDeprecatedMnemonic, () => {
  it('should throw an error if there is no wallet metadata stored', async () => {
    await expect(() => migrateDeprecatedMnemonic(testWalletMnemonicString)).rejects.toThrow()
  })

  it('should migrate mnemonic and delete old entries', async () => {
    addDeprecatedTestWalletMetadataInStorage()
    await migrateDeprecatedMnemonic(testWalletMnemonicString)

    expect(mockedSetItemAsync).toHaveBeenCalledWith(
      'wallet-mnemonic-v2',
      testWalletMnemonicStored,
      defaultSecureStoreConfig
    )
    expect(mockedDeleteItemAsync).toHaveBeenCalledTimes(2)
  })

  it('should migrate mnemonic even if there is no wallet metadata stored', async () => {
    expect(keyring['hdWallet']).toBeNull()

    await expect(() => migrateDeprecatedMnemonic(testWalletMnemonicString)).rejects.toThrow()
    expect(mockedSetItemAsync).toHaveBeenCalledWith(
      'wallet-mnemonic-v2',
      testWalletMnemonicStored,
      defaultSecureStoreConfig
    )
    expect(mockedDeleteItemAsync).toHaveBeenCalledTimes(2)
  })

  it('should clear secrets after migrating successfully', async () => {
    expect(keyring['hdWallet']).toBeNull()

    addDeprecatedTestWalletMetadataInStorage()
    await migrateDeprecatedMnemonic(testWalletMnemonicString)

    expect(keyring['hdWallet']).toBeNull()
  })

  it('should clear secrets even when there is an error', async () => {
    expect(keyring['hdWallet']).toBeNull()

    await expect(() => migrateDeprecatedMnemonic(testWalletMnemonicString)).rejects.toThrow()

    expect(keyring['hdWallet']).toBeNull()
  })

  it('should store public and private key in secure store', async () => {
    expect(keyring['hdWallet']).toBeNull()

    addDeprecatedTestWalletMetadataInStorage()
    await migrateDeprecatedMnemonic(testWalletMnemonicString)

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
    expect(keyring['hdWallet']).toBeNull()

    addDeprecatedTestWalletMetadataInStorage()
    await migrateDeprecatedMnemonic(testWalletMnemonicString)
    const wallet = await legacyGetStoredWalletMetadata()

    expect(isStoredWalletMetadataMigrated(wallet)).toBe(true)

    if (isStoredWalletMetadataMigrated(wallet)) {
      expect(wallet.addresses[0].hash).toEqual('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
      expect(wallet.addresses[1].hash).toEqual('1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf')
    }
  })
})

describe(deleteWallet, () => {
  it('should delete all wallet entries', async () => {
    addTestWalletMetadataInStorage()
    await deleteWallet(testWalletId)

    expect(mockedDeleteItemAsync).toHaveBeenCalledTimes(6)
    expect(mockedDeleteItemAsync).toHaveBeenCalledWith(`wallet-mnemonic-${testWalletId}`, defaultSecureStoreConfig)
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

    expect(storage.contains(`wallet-metadata-${testWalletId}`)).toBeFalsy()
    expect(storage.contains(`is-new-wallet-${testWalletId}`)).toBeFalsy()
  })
})

describe(validateAndRepairStoredWalletData, () => {
  it('should be valid if we have a mnemonic and metadata', async () => {
    mockedGetItemAsync.mockResolvedValueOnce(testWalletMnemonicStored)
    addTestWalletMetadataInLegacyStorage()

    const result = await validateAndRepairStoredWalletData()

    expect(result.status).toBe('valid')
  })

  it('should return needs-restore with correct appWasUninstalled flag', async () => {
    mockedGetItemAsync.mockResolvedValueOnce(testWalletMnemonicStored) // mock stored mnemonic
    mockedGetItemAsync.mockResolvedValueOnce('mocked-timestamp') // mock stored app-installed-on-persistent

    let result = await validateAndRepairStoredWalletData()

    expect(mockedGetItemAsync).toHaveBeenCalledTimes(2)
    expect(result.status).toBe('needs-restore')
    if (result.status === 'needs-restore') {
      expect(result.appWasUninstalled).toBe(true)
    }

    mockedGetItemAsync.mockResolvedValueOnce(testWalletMnemonicStored) // mock stored mnemonic
    mockedGetItemAsync.mockResolvedValueOnce(null) // mock stored app-installed-on-persistent

    result = await validateAndRepairStoredWalletData()

    expect(mockedGetItemAsync).toHaveBeenCalledTimes(4)
    expect(result.status).toBe('needs-restore')
    if (result.status === 'needs-restore') {
      expect(result.appWasUninstalled).toBe(false)
    }
  })

  it('should provide a restoreWallet function that recreates metadata', async () => {
    mockedGetItemAsync.mockResolvedValueOnce(testWalletMnemonicStored) // mock stored mnemonic
    mockedGetItemAsync.mockResolvedValueOnce('mocked-timestamp') // mock stored app-installed-on-persistent

    const result = await validateAndRepairStoredWalletData()

    expect(result.status).toBe('needs-restore')

    if (result.status === 'needs-restore') {
      // Before restore, no metadata
      const metadataBefore = await legacyGetWalletMetadata(false)
      expect(metadataBefore).toBeFalsy()

      // Restore wallet
      mockedGetItemAsync.mockResolvedValueOnce(testWalletMnemonicStored) // mock stored mnemonic for keyring init
      const success = await result.restoreWallet()

      expect(success).toBe(true)

      const metadataAfter = await legacyGetWalletMetadata(false)
      expect(metadataAfter).toBeTruthy()
      expect(metadataAfter?.addresses.length).toBe(1)
    }
  })

  it('should try to recreate deprecated metadata if deprecated mnemonic is there but metadata missing', async () => {
    mockedGetItemAsync.mockResolvedValueOnce(null) // mock missing mnemonic
    mockedGetItemAsync.mockResolvedValueOnce('mocked-timestamp') // mock stored app-installed-on-persistent
    mockedGetItemAsync.mockResolvedValueOnce('pinencryptedmnemonic') // mock stored pin encrypted deprecated mnemonic

    const result = await validateAndRepairStoredWalletData()

    expect(mockedGetItemAsync).toHaveBeenCalledTimes(3)
    expect(mockedGetItemAsync.mock.calls[0][0]).toBe('wallet-mnemonic-v2')
    expect(mockedGetItemAsync.mock.calls[1][0]).toBe('app-installed-on-persistent')
    expect(mockedGetItemAsync.mock.calls[2][0]).toBe('wallet-pin')

    const recreatedDeprecatedWalletMetadata = await legacyGetWalletMetadata(false)

    expect(recreatedDeprecatedWalletMetadata).toBeTruthy()
    expect(recreatedDeprecatedWalletMetadata?.addresses.length).toBe(1)

    if (recreatedDeprecatedWalletMetadata) {
      expect(isStoredWalletMetadataMigrated(recreatedDeprecatedWalletMetadata)).toBe(false)
    }
    expect(result.status).toBe('valid')
  })

  it('should delete metadata if no mnemonic and no deprecated mnemonic is found', async () => {
    mockedGetItemAsync.mockResolvedValueOnce(null) // mock missing mnemonic
    mockedGetItemAsync.mockResolvedValueOnce(null) // mock stored app-installed-on-persistent
    mockedGetItemAsync.mockResolvedValueOnce(null) // mock missing deprecated mnemonic
    addTestWalletMetadataInLegacyStorage()

    const result = await validateAndRepairStoredWalletData()

    expect(mockedGetItemAsync).toHaveBeenCalledTimes(3)

    const walletMetadata = await legacyGetWalletMetadata(false)

    expect(walletMetadata).toBeNull()
    expect(result.status).toBe('valid')
  })

  it('should be valid if no mnemonics and no metadata are found', async () => {
    mockedGetItemAsync.mockResolvedValueOnce(null) // mock missing mnemonic
    mockedGetItemAsync.mockResolvedValueOnce(null) // mock stored app-installed-on-persistent
    mockedGetItemAsync.mockResolvedValueOnce(null) // mock missing deprecated mnemonic

    const result = await validateAndRepairStoredWalletData()

    expect(mockedGetItemAsync).toHaveBeenCalledTimes(3)
    expect(result.status).toBe('valid')
  })

  it('should return invalid with error message when wallet list exists but no metadata', async () => {
    addWalletToList(createWalletListEntry(testWalletId, 'Test wallet', 'seed'))
    // Don't add metadata — simulates corrupted state

    const result = await validateAndRepairStoredWalletData()

    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('no valid wallet metadata')
    }
  })
})
