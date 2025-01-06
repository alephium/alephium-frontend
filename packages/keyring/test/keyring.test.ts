/**
 * @jest-environment jsdom
 */

import { bip39Words } from '@alephium/shared'
import { hashMessage } from '@alephium/web3'
import { bytesToHex } from 'ethereum-cryptography/utils'

import {
  dangerouslyConvertUint8ArrayMnemonicToString,
  decryptMnemonic,
  encryptMnemonic,
  Keyring,
  keyring
} from '@/index'

const valid24WordMnemonicString =
  'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'
const valid12WordMnemonicString = 'evolve sight make oppose mask corn fiber motor light duty pitch beauty'
const invalid24WordMnemonicString =
  'notABipWord alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'
const invalid12WordMnemonicString = 'notABipWord sight make oppose mask corn fiber motor light duty pitch beauty'
const encryptedWalletOld =
  '{"iv":"c4ff17839ca726820b495a2e8cfa67646c080b5aa58a763e7af152e258b90011c9732d3aa4cbba22ecdab9e6f0a2df39dc101415212d19dad585515ffea98c9d","encrypted":"646af7d816051cb0e2ce24666540d550d806a6c626707e1b245c935c74bd53c1d0b27263d5ccce13325f002d032ffc2194e5fa27f8960bd725c2a97f3bbe624314a2b10848e3c3a2e87cf101e09c15502f320f5f21323dbe8b6b45058cda848b525ff6838c8a4c784963a6265f7aa06e0579c14f3a640b5fa36848d583452710750ba50cbe119d7e09549caa6a87955f60e90de843ead00c2d4f6431f4540e13c6c3ed3cd99b7dde535d594f53a48857219f4101a0b7390f366cee0ef4531783","salt":"b28b89dfb33df74aba2c5990d002dc2d7bc00728601fc81907c3005472938478fb76be235efd4c591d1ce4f1b1e22b0e8064c7276a03c3946d628cd990d0ce90","version":1}'
const encryptedWalletNew =
  '{"data":"5R+ieDZX33zMpWHt41eZ/9m9eBaZQQVYTWhY1XTJIKGmD2De05CAF2geT6rDYoDX+uPeZNauGf1820nUfAaX8MtjhQKwC7liv9BCCj5onFVTL3DtulstQafeWW7eMmMm9JWstMk6fryxzFmX0jrjDs1U+jngRryfL3gdY55HsaN34/RlAZ0jA2RY7yh9WikmPpH0WVFzqPVwHJbUMpbsm/dFkpCG6k168Y69MZyJmq3wdD8AL7IYFGkqo9QpKmIyq/LtSHu6AaQc88i4ChWg+ksQZfY42XRodj6955o28BY3oIFhAKMSWl85tXNyIacIwcf6L5Og3KsEAlYM9bae/wtVc1Cv8NTjsHho/tC3fkeerxVu9dIZlNk4CYNjhXfJlCN0hoYMDZSc5CnqA3w9XEdQp7V15N5ipgyZxyGzjITDHZTZ7RIwsxt/qOU94XWRgIn+BwapFwL7zW3avORyQrGW8CFxj1gFfuqb4Ll5SHofPYz6fqIHXxBUQ9GC29Afztv+Dpb4klOiLezIoOS2hHMPmn8D7w==","iv":"1JtRo+s/lwJnuAhQ/i33xg==","keyMetadata":{"algorithm":"PBKDF2","params":{"iterations":900000}},"salt":"aHxa0BGBUBEIRS8uSaXRjDt7DCMuvcP6t7t/s5+xCRk="}'
const correctPassword = 'passw0rd'
const wrongPassword = 'passw1rd'

describe('keyring', function () {
  it('should create an empty instance of the Keyring class', () => {
    expect(keyring).toBeInstanceOf(Keyring),
      expect(keyring['hdWallet']).toBeNull(),
      expect(keyring['root']).toBeNull(),
      expect(keyring['addresses']).toHaveLength(0)
  })

  it('should have the correct HD path', () => {
    expect(keyring['hdPath']).toBe("m/44'/1234'/0'/0")
  })

  it('should get initialized with a random mnemonic', () => {
    keyring.generateRandomMnemonic()

    expect(keyring['hdWallet']).not.toBeNull(),
      expect(keyring['root']).not.toBeNull(),
      expect(keyring['addresses']).toHaveLength(0)
  })

  it('should fail generating new mnemonic if already initialized', () => {
    expect(() => keyring.generateRandomMnemonic()).toThrow()
  })

  it('should succeed generating new mnemonic if secrets are cleared', () => {
    keyring.clear()
    keyring.generateRandomMnemonic()

    expect(keyring['hdWallet']).not.toBeNull(),
      expect(keyring['root']).not.toBeNull(),
      expect(keyring['addresses']).toHaveLength(0)
  })

  it('should generate a Uint8Array mnemonic of indexes of words of bip39 word list', () => {
    keyring.clear()
    const mnemonic = keyring.generateRandomMnemonic(12)

    expect(mnemonic).toBeInstanceOf(Uint8Array)

    const indexes = Array.from(new Uint16Array(new Uint8Array(mnemonic).buffer))

    indexes.forEach((index) => {
      expect(index).toBeGreaterThanOrEqual(0), expect(index).toBeLessThan(bip39Words.length)
    })
  })

  it('should generate the correct mnemonic length', () => {
    keyring.clear()
    let mnemonic = keyring.generateRandomMnemonic(12)
    let indexes = Array.from(new Uint16Array(new Uint8Array(mnemonic).buffer))
    expect(indexes).toHaveLength(12)

    keyring.clear()
    mnemonic = keyring.generateRandomMnemonic(24)
    indexes = Array.from(new Uint16Array(new Uint8Array(mnemonic).buffer))
    expect(indexes).toHaveLength(24)
  })

  it('should initialize from a valid 24 word mnemonic string', () => {
    keyring.importMnemonicString(valid24WordMnemonicString)

    expect(keyring['hdWallet']).not.toBeNull(),
      expect(keyring['root']).not.toBeNull(),
      expect(keyring['addresses']).toHaveLength(0)
  })

  it('should initialize from a valid 12 word mnemonic string', () => {
    keyring.importMnemonicString(valid12WordMnemonicString)

    expect(keyring['hdWallet']).not.toBeNull(),
      expect(keyring['root']).not.toBeNull(),
      expect(keyring['addresses']).toHaveLength(0)
  })

  it('should fail to initialize from an invalid 24 word mnemonic string', () => {
    expect(() => keyring.importMnemonicString(invalid24WordMnemonicString)).toThrow()
  })

  it('should fail to initialize from an invalid 12 word mnemonic string', () => {
    expect(() => keyring.importMnemonicString(invalid12WordMnemonicString)).toThrow()
  })

  it('should fail to initialize from an empty mnemonic string', () => {
    expect(() => keyring.importMnemonicString('')).toThrow()
  })

  it('should return a Uint8Array of indexes of words of bip39 word list when importing a valid mnemonic string', () => {
    const mnemonic = keyring.importMnemonicString(valid24WordMnemonicString)

    expect(mnemonic).toBeInstanceOf(Uint8Array)

    const indexes = Array.from(new Uint16Array(new Uint8Array(mnemonic).buffer))

    indexes.forEach((index) => {
      expect(index).toBeGreaterThanOrEqual(0), expect(index).toBeLessThan(bip39Words.length)
    })
  })

  it('should return a Uint8Array of the correct length when importing a valid mnemonic string', () => {
    let mnemonic = keyring.importMnemonicString(valid24WordMnemonicString)
    let indexes = Array.from(new Uint16Array(new Uint8Array(mnemonic).buffer))
    expect(indexes).toHaveLength(24)

    mnemonic = keyring.importMnemonicString(valid12WordMnemonicString)
    indexes = Array.from(new Uint16Array(new Uint8Array(mnemonic).buffer))
    expect(indexes).toHaveLength(12)
  })

  it('should initialize from old-format encrypted mnemonic when the correct password is given', () => {
    keyring.initFromEncryptedMnemonic(encryptedWalletOld, correctPassword, '')
    expect(keyring['hdWallet']).not.toBeNull(),
      expect(keyring['root']).not.toBeNull(),
      expect(keyring['addresses']).toHaveLength(0)
  })

  it('should initialize from new-format encrypted mnemonic when the correct password is given', () => {
    keyring.initFromEncryptedMnemonic(encryptedWalletNew, correctPassword, '')
    expect(keyring['hdWallet']).not.toBeNull(),
      expect(keyring['root']).not.toBeNull(),
      expect(keyring['addresses']).toHaveLength(0)
  })

  it('should fail to initialize from old-format encrypted mnemonic when an incorrect password is given', () => {
    keyring.clear()
    expect(() => keyring.initFromEncryptedMnemonic(encryptedWalletOld, wrongPassword, '')).rejects.toThrow()
    expect(keyring['hdWallet']).toBeNull(),
      expect(keyring['root']).toBeNull(),
      expect(keyring['addresses']).toHaveLength(0)
  })

  it('should fail to initialize from new-format encrypted mnemonic when an incorrect password is given', () => {
    expect(() => keyring.initFromEncryptedMnemonic(encryptedWalletNew, wrongPassword, '')).rejects.toThrow()
    expect(keyring['hdWallet']).toBeNull(),
      expect(keyring['root']).toBeNull(),
      expect(keyring['addresses']).toHaveLength(0)
  })

  it('should return the correct mnemonic version when initializing from encrypted mnemonic', async () => {
    let version = await keyring.initFromEncryptedMnemonic(encryptedWalletOld, correctPassword, '')
    expect(version).toBe(1)

    version = await keyring.initFromEncryptedMnemonic(encryptedWalletNew, correctPassword, '')
    expect(version).toBe(2)
  })

  it('should generate the correct address given its index', () => {
    keyring.importMnemonicString(valid24WordMnemonicString)
    let address = keyring.generateAndCacheAddress({ addressIndex: 0 })
    expect(address.index).toBe(0)
    expect(address.hash).toBe('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
    expect(address.publicKey).toBe('0381818e63bd9e35a5489b52a430accefc608fd60aa2c7c0d1b393b5239aedf6b0')

    address = keyring.generateAndCacheAddress({ addressIndex: 4 })
    expect(address.index).toBe(4)
    expect(address.hash).toBe('1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf')
    expect(address.publicKey).toBe('03cc2d92123def7c72bd4dd8ec1c6c41ea1fbeceac0b33dbffb42777f0ca3ea4d8')
  })

  it('should generate the address in the next available index', () => {
    keyring.importMnemonicString(valid24WordMnemonicString)
    let address = keyring.generateAndCacheAddress({ skipAddressIndexes: [1, 2, 3] })
    expect(address.index).toBe(0)
    expect(address.hash).toBe('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
    expect(address.publicKey).toBe('0381818e63bd9e35a5489b52a430accefc608fd60aa2c7c0d1b393b5239aedf6b0')

    address = keyring.generateAndCacheAddress({ skipAddressIndexes: [0, 1, 2, 3] })
    expect(address.index).toBe(4)
    expect(address.hash).toBe('1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf')
    expect(address.publicKey).toBe('03cc2d92123def7c72bd4dd8ec1c6c41ea1fbeceac0b33dbffb42777f0ca3ea4d8')
  })

  it('should generate an address in the given group', () => {
    keyring.importMnemonicString(valid24WordMnemonicString)
    let address = keyring.generateAndCacheAddress({ group: 0 })
    expect(address.index).toBe(0)
    expect(address.hash).toBe('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
    expect(address.publicKey).toBe('0381818e63bd9e35a5489b52a430accefc608fd60aa2c7c0d1b393b5239aedf6b0')

    address = keyring.generateAndCacheAddress({ group: 2, skipAddressIndexes: [1] })
    expect(address.index).toBe(4)
    expect(address.hash).toBe('1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf')
    expect(address.publicKey).toBe('03cc2d92123def7c72bd4dd8ec1c6c41ea1fbeceac0b33dbffb42777f0ca3ea4d8')

    address = keyring.generateAndCacheAddress({ group: 2 })
    expect(address.index).toBe(1)
    expect(address.hash).toBe('15jjExDyS8q3Wqk9v29PCQ21jDqubDrD8WQdgn6VW2oi4')
    expect(address.publicKey).toBe('028bff16a5102770af5ef0171887cdc0f7dd8b8923f6533806fa3bff637ebcfbfb')
  })

  it('should cache generated addresses', () => {
    keyring.importMnemonicString(valid24WordMnemonicString)
    keyring.generateAndCacheAddress({ addressIndex: 0 })
    keyring.generateAndCacheAddress({ addressIndex: 4 })

    expect(keyring['addresses']).toHaveLength(2)
    expect(keyring['addresses'][0].index).toBe(0)
    expect(keyring['addresses'][0].hash).toBe('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
    expect(keyring['addresses'][0].privateKey).not.toBeNull()
    expect(keyring['addresses'][0].privateKey && bytesToHex(keyring['addresses'][0].privateKey)).toBe(
      'a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5'
    )
    expect(keyring['addresses'][1].index).toBe(4)
    expect(keyring['addresses'][1].hash).toBe('1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf')
    expect(keyring['addresses'][1].privateKey).not.toBeNull()
    expect(keyring['addresses'][1].privateKey && bytesToHex(keyring['addresses'][1].privateKey)).toBe(
      '053b33e3330b4e9b6636d3062e332f47bf700104a4e18cbeb16efd2ae7cbbae1'
    )
  })

  it('should not re-generate an address that is already cached', () => {
    keyring.importMnemonicString(valid24WordMnemonicString)
    keyring.generateAndCacheAddress({ addressIndex: 0 })
    keyring.generateAndCacheAddress({ addressIndex: 4 })

    expect(keyring['addresses']).toHaveLength(2)

    keyring.generateAndCacheAddress({ addressIndex: 0 })
    expect(keyring['addresses']).toHaveLength(2)
  })

  it('should fail generating an address when wrong arguments are given', () => {
    keyring.importMnemonicString(valid24WordMnemonicString)
    expect(() => keyring.generateAndCacheAddress({ addressIndex: 0, skipAddressIndexes: [0] })).toThrow()
    expect(() => keyring.generateAndCacheAddress({ addressIndex: 0, group: 0 })).toThrow()
    expect(() => keyring.generateAndCacheAddress({ group: -1 })).toThrow()
    expect(() => keyring.generateAndCacheAddress({ group: 5 })).toThrow()
    expect(() => keyring.generateAndCacheAddress({ group: 1.2 })).toThrow()
    expect(() => keyring.generateAndCacheAddress({ group: 10e12 })).toThrow()
    expect(() => keyring.generateAndCacheAddress({ addressIndex: -1 })).toThrow()
    expect(() => keyring.generateAndCacheAddress({ addressIndex: 1.2 })).toThrow()
    expect(() => keyring.generateAndCacheAddress({ addressIndex: 10e12 })).toThrow()
  })

  it('should export the private key of an address', () => {
    keyring.importMnemonicString(valid24WordMnemonicString)
    keyring.generateAndCacheAddress({ addressIndex: 0 })
    keyring.generateAndCacheAddress({ addressIndex: 4 })
    expect(keyring.exportPrivateKeyOfAddress('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')).toBe(
      'a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5'
    )
    expect(keyring.exportPrivateKeyOfAddress('1Bf9jthiwQo74V94LHT37dwEEiV22KkpKySf4TmRDzZqf')).toBe(
      '053b33e3330b4e9b6636d3062e332f47bf700104a4e18cbeb16efd2ae7cbbae1'
    )
  })

  it('should fail to export the private key of an address that is not cached', () => {
    expect(() => keyring.exportPrivateKeyOfAddress('disAddressDoesNotExistBro')).toThrow()
  })

  it('should sign a transaction with the private key of the address', () => {
    keyring.importMnemonicString(valid24WordMnemonicString)
    keyring.generateAndCacheAddress({ addressIndex: 0 })
    expect(
      keyring.signTransaction(
        '0041313469a65f07904379d53915d86e5ed4541a7583762de38a1a3fed4ff1bd',
        '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
      )
    ).toBe(
      '2db14fa10d8bc6ff368ac3a51c6c42c09c5d2008b8dc571a325fcae2d8dcbc2c49f0722bbc6050a41c23f3509eb0cc0660205a6be6512dda3b4c8bcadae75f29'
    )
  })

  it('should fail to sign a transaction when given an address that is not cached', () => {
    keyring.importMnemonicString(valid24WordMnemonicString)
    expect(() => keyring.signMessageHash(hashMessage('hello', 'alephium'), 'thisAddressDoesntExist')).toThrow()
  })

  it('should sign a message with the private key of the address', () => {
    keyring.importMnemonicString(valid24WordMnemonicString)
    keyring.generateAndCacheAddress({ addressIndex: 0 })

    expect(
      keyring.signMessageHash(hashMessage('hello', 'alephium'), '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
    ).toBe(
      '65386c8b48c20aaf1e170323bdeadd75bcbdaf82f7ad0e838ce4ad661bb7c7d33151e07599ca70f468759c27f2ec24ca4ac2a45e4d04be393e0181dcf345c41a'
    )
  })

  it('should fail to sign a message when given an address that is not cached', () => {
    keyring.importMnemonicString(valid24WordMnemonicString)
    expect(() => keyring.signTransaction('hello', 'thisAddressDoesntExist')).toThrow()
  })

  it('should convert Uint8Array mnemonic to string', () => {
    const mnemonic = keyring.importMnemonicString(valid24WordMnemonicString)
    expect(dangerouslyConvertUint8ArrayMnemonicToString(mnemonic)).toBe(valid24WordMnemonicString)
  })

  it('should encrypt a Uint8Array mnemonic', async () => {
    keyring.clear()
    const mnemonic = keyring.generateRandomMnemonic()
    const mnemonicStr = dangerouslyConvertUint8ArrayMnemonicToString(mnemonic)
    const encryptedMnemonic = await encryptMnemonic(mnemonic, correctPassword)

    expect(encryptedMnemonic).toBeDefined()

    const decrypted = await decryptMnemonic(encryptedMnemonic, correctPassword)

    expect(decrypted.version).toBe(2)
    expect(dangerouslyConvertUint8ArrayMnemonicToString(decrypted.decryptedMnemonic)).toBe(mnemonicStr)
  })

  it('should fail to encrypt an invalid Uint8Array mnemonic', () => {
    keyring.clear()
    const mnemonic = keyring.generateRandomMnemonic()
    mnemonic[0] = -1
    expect(() => encryptMnemonic(mnemonic, correctPassword)).rejects.toThrow()
  })
})
