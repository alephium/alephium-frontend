import * as SecureStore from 'expo-secure-store'

import { defaultSecureStoreConfig } from '~/persistent-storage/config'
import { runMultiWalletMigrationIfNeeded } from '~/persistent-storage/migrations/multiWalletMigration'
import { storage } from '~/persistent-storage/storage'
import {
  LEGACY_IS_NEW_WALLET_KEY,
  LEGACY_MNEMONIC_KEY,
  LEGACY_WALLET_METADATA_KEY,
  walletMnemonicKey
} from '~/persistent-storage/wallet'
import { getWalletList } from '~/persistent-storage/walletList'

const mockedGetItemAsync = vi.mocked(SecureStore.getItemAsync)
const mockedSetItemAsync = vi.mocked(SecureStore.setItemAsync)
const mockedDeleteItemAsync = vi.mocked(SecureStore.deleteItemAsync)

const testWalletId = 'test-wallet-id-123'
const testWalletName = 'My wallet'
const testMnemonicStored = '{"0":142,"1":7,"2":46}'

const testMetadata = {
  id: testWalletId,
  name: testWalletName,
  isMnemonicBackedUp: true,
  addresses: [
    {
      index: 0,
      keyType: 'default' as const,
      hash: '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH',
      isDefault: true,
      color: 'red'
    }
  ],
  contacts: [{ id: 'c1', name: 'Alice', address: '1abc' }]
}

afterEach(() => {
  storage.clearAll()
  mockedGetItemAsync.mockReset()
  mockedSetItemAsync.mockReset()
  mockedDeleteItemAsync.mockReset()
})

describe('Multi-wallet migration', () => {
  describe('Fresh install (no existing data)', () => {
    it('should set version flag and skip migration', async () => {
      mockedGetItemAsync.mockResolvedValue(null) // No mnemonic

      await runMultiWalletMigrationIfNeeded()

      expect(storage.getNumber('multi-wallet-migration-version')).toBe(1)
      expect(getWalletList()).toEqual([])
      expect(mockedSetItemAsync).not.toHaveBeenCalled()
    })
  })

  describe('Already migrated', () => {
    it('should skip if version flag is already set', async () => {
      storage.set('multi-wallet-migration-version', 1)

      await runMultiWalletMigrationIfNeeded()

      expect(mockedGetItemAsync).not.toHaveBeenCalled()
      expect(mockedSetItemAsync).not.toHaveBeenCalled()
    })

    it('should skip if version flag is higher than current', async () => {
      storage.set('multi-wallet-migration-version', 99)

      await runMultiWalletMigrationIfNeeded()

      expect(mockedGetItemAsync).not.toHaveBeenCalled()
    })
  })

  describe('Happy path migration', () => {
    beforeEach(() => {
      storage.set(LEGACY_WALLET_METADATA_KEY, JSON.stringify(testMetadata))
      mockedGetItemAsync.mockImplementation(async (key) => {
        if (key === LEGACY_MNEMONIC_KEY) return testMnemonicStored
        if (key === walletMnemonicKey(testWalletId)) return testMnemonicStored // verification read-back
        return null
      })
    })

    it('should write metadata to wallet-ID-scoped key', async () => {
      await runMultiWalletMigrationIfNeeded()

      const migratedRaw = storage.getString(`wallet-metadata-${testWalletId}`)
      expect(migratedRaw).toBeDefined()

      const migrated = JSON.parse(migratedRaw!)
      expect(migrated.id).toBe(testWalletId)
      expect(migrated.name).toBe(testWalletName)
      expect(migrated.type).toBe('seed')
      expect(migrated.addresses).toEqual(testMetadata.addresses)
      expect(migrated.contacts).toEqual(testMetadata.contacts)
    })

    it('should write mnemonic to wallet-ID-scoped SecureStore key', async () => {
      await runMultiWalletMigrationIfNeeded()

      expect(mockedSetItemAsync).toHaveBeenCalledWith(
        walletMnemonicKey(testWalletId),
        testMnemonicStored,
        defaultSecureStoreConfig
      )
    })

    it('should verify mnemonic by reading it back after writing', async () => {
      await runMultiWalletMigrationIfNeeded()

      // First getItemAsync call: read legacy mnemonic
      expect(mockedGetItemAsync.mock.calls[0][0]).toBe(LEGACY_MNEMONIC_KEY)
      // Second getItemAsync call: verify new key
      expect(mockedGetItemAsync.mock.calls[1][0]).toBe(walletMnemonicKey(testWalletId))
    })

    it('should create a wallet list with the migrated wallet', async () => {
      await runMultiWalletMigrationIfNeeded()

      const walletList = getWalletList()
      expect(walletList).toHaveLength(1)
      expect(walletList[0].id).toBe(testWalletId)
      expect(walletList[0].name).toBe(testWalletName)
      expect(walletList[0].type).toBe('seed')
    })

    it('should set migration version flag', async () => {
      await runMultiWalletMigrationIfNeeded()

      expect(storage.getNumber('multi-wallet-migration-version')).toBe(1)
    })

    it('should delete legacy metadata key', async () => {
      await runMultiWalletMigrationIfNeeded()

      expect(storage.contains(LEGACY_WALLET_METADATA_KEY)).toBe(false)
    })

    it('should delete legacy mnemonic from SecureStore', async () => {
      await runMultiWalletMigrationIfNeeded()

      expect(mockedDeleteItemAsync).toHaveBeenCalledWith(LEGACY_MNEMONIC_KEY, defaultSecureStoreConfig)
    })

    it('should preserve all address metadata during migration', async () => {
      await runMultiWalletMigrationIfNeeded()

      const migrated = JSON.parse(storage.getString(`wallet-metadata-${testWalletId}`)!)
      expect(migrated.addresses[0].hash).toBe('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
      expect(migrated.addresses[0].index).toBe(0)
      expect(migrated.addresses[0].isDefault).toBe(true)
    })

    it('should preserve contacts during migration', async () => {
      await runMultiWalletMigrationIfNeeded()

      const migrated = JSON.parse(storage.getString(`wallet-metadata-${testWalletId}`)!)
      expect(migrated.contacts).toEqual([{ id: 'c1', name: 'Alice', address: '1abc' }])
    })
  })

  describe('Optional data migration', () => {
    beforeEach(() => {
      storage.set(LEGACY_WALLET_METADATA_KEY, JSON.stringify(testMetadata))
      mockedGetItemAsync.mockImplementation(async (key) => {
        if (key === LEGACY_MNEMONIC_KEY) return testMnemonicStored
        if (key === walletMnemonicKey(testWalletId)) return testMnemonicStored
        if (key === 'fund-password') return 'my-secret-fund-pw'
        return null
      })
    })

    it('should migrate fund password to wallet-ID-scoped key', async () => {
      await runMultiWalletMigrationIfNeeded()

      expect(mockedSetItemAsync).toHaveBeenCalledWith(
        `fund-password-${testWalletId}`,
        'my-secret-fund-pw',
        defaultSecureStoreConfig
      )
    })

    it('should migrate hidden tokens to wallet-ID-scoped key', async () => {
      const hiddenTokens = JSON.stringify(['token-1', 'token-2'])
      storage.set('alephium_hidden_assets_ids', hiddenTokens)

      await runMultiWalletMigrationIfNeeded()

      expect(storage.getString(`hidden-tokens-${testWalletId}`)).toBe(hiddenTokens)
      expect(storage.contains('alephium_hidden_assets_ids')).toBe(false)
    })

    it('should migrate is-new-wallet flag to wallet-ID-scoped key', async () => {
      storage.set(LEGACY_IS_NEW_WALLET_KEY, false)

      await runMultiWalletMigrationIfNeeded()

      expect(storage.getBoolean(`is-new-wallet-${testWalletId}`)).toBe(false)
      expect(storage.contains(LEGACY_IS_NEW_WALLET_KEY)).toBe(false)
    })

    it('should migrate authorized connections to wallet-ID-scoped key', async () => {
      const connections = JSON.stringify([{ host: 'app.example.com', dateTime: Date.now() }])
      storage.set('alephium-dapp-authorized-connections', connections)

      await runMultiWalletMigrationIfNeeded()

      expect(storage.getString(`authorized-connections-${testWalletId}`)).toBe(connections)
      expect(storage.contains('alephium-dapp-authorized-connections')).toBe(false)
    })

    it('should handle missing optional data gracefully', async () => {
      // No hidden tokens, no is-new-wallet, no authorized connections set

      await runMultiWalletMigrationIfNeeded()

      // Migration should complete without errors
      expect(storage.getNumber('multi-wallet-migration-version')).toBe(1)
      expect(storage.contains(`hidden-tokens-${testWalletId}`)).toBe(false)
      expect(storage.contains(`is-new-wallet-${testWalletId}`)).toBe(false)
      expect(storage.contains(`authorized-connections-${testWalletId}`)).toBe(false)
    })

    it('should delete legacy fund password from SecureStore', async () => {
      await runMultiWalletMigrationIfNeeded()

      expect(mockedDeleteItemAsync).toHaveBeenCalledWith('fund-password', defaultSecureStoreConfig)
    })
  })

  describe('Mnemonic verification failure', () => {
    it('should abort and NOT delete legacy keys when verification fails', async () => {
      storage.set(LEGACY_WALLET_METADATA_KEY, JSON.stringify(testMetadata))

      mockedGetItemAsync.mockImplementation(async (key) => {
        if (key === LEGACY_MNEMONIC_KEY) return testMnemonicStored
        if (key === walletMnemonicKey(testWalletId)) return 'CORRUPTED_DATA' // verification mismatch
        return null
      })

      await runMultiWalletMigrationIfNeeded()

      // Legacy keys should still exist
      expect(storage.contains(LEGACY_WALLET_METADATA_KEY)).toBe(true)

      // New keys should be cleaned up
      expect(storage.contains(`wallet-metadata-${testWalletId}`)).toBe(false)

      // Version flag should NOT be set
      expect(storage.getNumber('multi-wallet-migration-version')).toBeUndefined()

      // Wallet list should NOT be created
      expect(getWalletList()).toEqual([])

      // Legacy mnemonic should NOT be deleted
      expect(mockedDeleteItemAsync).not.toHaveBeenCalledWith(LEGACY_MNEMONIC_KEY, defaultSecureStoreConfig)
    })
  })

  describe('SecureStore write failure', () => {
    it('should not delete legacy keys when mnemonic write fails', async () => {
      storage.set(LEGACY_WALLET_METADATA_KEY, JSON.stringify(testMetadata))

      mockedGetItemAsync.mockImplementation(async (key) => {
        if (key === LEGACY_MNEMONIC_KEY) return testMnemonicStored
        return null
      })

      mockedSetItemAsync.mockRejectedValue(new Error('SecureStore full'))

      await runMultiWalletMigrationIfNeeded()

      // Legacy metadata should still exist (migration failed, old keys preserved)
      expect(storage.contains(LEGACY_WALLET_METADATA_KEY)).toBe(true)

      // Version flag should NOT be set
      expect(storage.getNumber('multi-wallet-migration-version')).toBeUndefined()

      // Wallet list should NOT be created
      expect(getWalletList()).toEqual([])
    })
  })

  describe('Deferred migration scenarios', () => {
    it('should defer when metadata exists but no V2 mnemonic (deprecated-only wallet)', async () => {
      storage.set(LEGACY_WALLET_METADATA_KEY, JSON.stringify(testMetadata))
      mockedGetItemAsync.mockResolvedValue(null) // No mnemonic

      await runMultiWalletMigrationIfNeeded()

      // Should NOT set version flag (will retry next launch after deprecated migration)
      expect(storage.getNumber('multi-wallet-migration-version')).toBeUndefined()

      // Legacy keys should be untouched
      expect(storage.contains(LEGACY_WALLET_METADATA_KEY)).toBe(true)

      // No wallet list created
      expect(getWalletList()).toEqual([])
    })

    it('should defer when V2 mnemonic exists but no metadata', async () => {
      // No metadata in MMKV
      mockedGetItemAsync.mockImplementation(async (key) => {
        if (key === LEGACY_MNEMONIC_KEY) return testMnemonicStored
        return null
      })

      await runMultiWalletMigrationIfNeeded()

      // Should NOT set version flag (validateAndRepareStoredWalletData will handle)
      expect(storage.getNumber('multi-wallet-migration-version')).toBeUndefined()

      // No wallet list created
      expect(getWalletList()).toEqual([])
    })
  })

  describe('Corrupted data handling', () => {
    it('should handle corrupted metadata JSON without crashing', async () => {
      storage.set(LEGACY_WALLET_METADATA_KEY, 'not valid json {{{')

      await runMultiWalletMigrationIfNeeded()

      // Should not crash, should not set version flag
      expect(storage.getNumber('multi-wallet-migration-version')).toBeUndefined()

      // Legacy data should be untouched
      expect(storage.getString(LEGACY_WALLET_METADATA_KEY)).toBe('not valid json {{{')
    })

    it('should handle metadata with missing id field', async () => {
      const metadataWithoutId = { ...testMetadata, id: '' }
      storage.set(LEGACY_WALLET_METADATA_KEY, JSON.stringify(metadataWithoutId))

      await runMultiWalletMigrationIfNeeded()

      // Should not proceed, should not set version flag
      expect(storage.getNumber('multi-wallet-migration-version')).toBeUndefined()
    })
  })

  describe('Idempotency', () => {
    it('should be safe to run migration twice', async () => {
      storage.set(LEGACY_WALLET_METADATA_KEY, JSON.stringify(testMetadata))
      mockedGetItemAsync.mockImplementation(async (key) => {
        if (key === LEGACY_MNEMONIC_KEY) return testMnemonicStored
        if (key === walletMnemonicKey(testWalletId)) return testMnemonicStored
        return null
      })

      // First run
      await runMultiWalletMigrationIfNeeded()
      expect(storage.getNumber('multi-wallet-migration-version')).toBe(1)

      const walletListAfterFirst = getWalletList()
      const metadataAfterFirst = storage.getString(`wallet-metadata-${testWalletId}`)

      // Second run
      await runMultiWalletMigrationIfNeeded()

      // Should be identical
      expect(getWalletList()).toEqual(walletListAfterFirst)
      expect(storage.getString(`wallet-metadata-${testWalletId}`)).toBe(metadataAfterFirst)
    })
  })

  describe('Migration ordering guarantees', () => {
    it('should set version flag BEFORE deleting legacy keys', async () => {
      storage.set(LEGACY_WALLET_METADATA_KEY, JSON.stringify(testMetadata))

      const operationOrder: string[] = []

      // Track MMKV operations
      const originalSet = storage.set.bind(storage)
      const originalDelete = storage.delete.bind(storage)

      vi.spyOn(storage, 'set').mockImplementation((key: string, value: unknown) => {
        if (key === 'multi-wallet-migration-version') operationOrder.push('set-version')
        return originalSet(key, value as string | number | boolean | ArrayBuffer)
      })

      vi.spyOn(storage, 'delete').mockImplementation((key: string) => {
        if (key === LEGACY_WALLET_METADATA_KEY) operationOrder.push('delete-legacy-metadata')
        return originalDelete(key)
      })

      mockedGetItemAsync.mockImplementation(async (key) => {
        if (key === LEGACY_MNEMONIC_KEY) return testMnemonicStored
        if (key === walletMnemonicKey(testWalletId)) return testMnemonicStored
        return null
      })

      await runMultiWalletMigrationIfNeeded()

      const versionIdx = operationOrder.indexOf('set-version')
      const deleteIdx = operationOrder.indexOf('delete-legacy-metadata')

      expect(versionIdx).toBeGreaterThanOrEqual(0)
      expect(deleteIdx).toBeGreaterThanOrEqual(0)
      expect(versionIdx).toBeLessThan(deleteIdx)
    })

    it('should write new keys BEFORE deleting legacy keys', async () => {
      storage.set(LEGACY_WALLET_METADATA_KEY, JSON.stringify(testMetadata))

      const operationOrder: string[] = []

      const originalSet = storage.set.bind(storage)
      const originalDelete = storage.delete.bind(storage)

      vi.spyOn(storage, 'set').mockImplementation((key: string, value: unknown) => {
        if (key === `wallet-metadata-${testWalletId}`) operationOrder.push('write-new-metadata')
        return originalSet(key, value as string | number | boolean | ArrayBuffer)
      })

      vi.spyOn(storage, 'delete').mockImplementation((key: string) => {
        if (key === LEGACY_WALLET_METADATA_KEY) operationOrder.push('delete-legacy-metadata')
        return originalDelete(key)
      })

      mockedGetItemAsync.mockImplementation(async (key) => {
        if (key === LEGACY_MNEMONIC_KEY) return testMnemonicStored
        if (key === walletMnemonicKey(testWalletId)) return testMnemonicStored
        return null
      })

      await runMultiWalletMigrationIfNeeded()

      const writeIdx = operationOrder.indexOf('write-new-metadata')
      const deleteIdx = operationOrder.indexOf('delete-legacy-metadata')

      expect(writeIdx).toBeGreaterThanOrEqual(0)
      expect(deleteIdx).toBeGreaterThanOrEqual(0)
      expect(writeIdx).toBeLessThan(deleteIdx)
    })
  })

  describe('Multiple addresses', () => {
    it('should preserve all addresses during migration', async () => {
      const multiAddressMetadata = {
        ...testMetadata,
        addresses: [
          { index: 0, keyType: 'default' as const, hash: 'addr1', isDefault: true, color: 'red' },
          { index: 1, keyType: 'default' as const, hash: 'addr2', isDefault: false, color: 'blue' },
          {
            index: 0,
            keyType: 'bip340-schnorr' as const,
            hash: 'addr3',
            isDefault: false,
            color: 'green',
            label: 'Schnorr'
          }
        ]
      }

      storage.set(LEGACY_WALLET_METADATA_KEY, JSON.stringify(multiAddressMetadata))
      mockedGetItemAsync.mockImplementation(async (key) => {
        if (key === LEGACY_MNEMONIC_KEY) return testMnemonicStored
        if (key === walletMnemonicKey(testWalletId)) return testMnemonicStored
        return null
      })

      await runMultiWalletMigrationIfNeeded()

      const migrated = JSON.parse(storage.getString(`wallet-metadata-${testWalletId}`)!)
      expect(migrated.addresses).toHaveLength(3)
      expect(migrated.addresses[0].hash).toBe('addr1')
      expect(migrated.addresses[1].hash).toBe('addr2')
      expect(migrated.addresses[2].hash).toBe('addr3')
      expect(migrated.addresses[2].label).toBe('Schnorr')
    })
  })
})
