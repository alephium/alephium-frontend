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

import { addressToGroup, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import rewire from 'rewire'

import * as walletUtils from '../lib/wallet'
import genesis from './fixtures/genesis.json'
import wallets from './fixtures/wallets.json'

describe('Wallet', function () {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should encrypt and decrypt using password', async () => {
    const myPassword = 'alephium'
    const myWallet = walletUtils.walletGenerate()
    const readWallet = await walletUtils.walletOpen(myPassword, myWallet.encrypt(myPassword))
    expect(JSON.stringify(myWallet)).toEqual(JSON.stringify(readWallet))

    const wrongPassword = 'utopia'
    await expect(() => {
      walletUtils.walletOpen(wrongPassword, myWallet.encrypt(myPassword))
    }).toThrow('Unsupported state or unable to authenticate data')
  })

  it('should import wallet in a compatible manner', () => {
    const randomAddress = '143jS8xaGNNRes4f1mxJWSpQcqj2xjsXUeu3xQqYgFm5h'
    const randomPubKey = '034817bc790123a551aa82453cc2ca1dd5ea7a9ffb85443a1a67936c3299d7a751'
    const randomPriKey = '695ac21c784d0d3f9f5441de0ee07f724d12be258f0ebdaef7ff5ee540f8e2d8'
    genesis.forEach(function (row: { mnemonic: string; address: string; pubKey: string; priKey: string }) {
      const myWallet = walletUtils.walletImport(row.mnemonic)
      expect(row.address).toEqual(myWallet.address)
      expect(row.address).not.toEqual(randomAddress)
      expect(row.pubKey).toEqual(myWallet.publicKey)
      expect(row.pubKey).not.toEqual(randomPubKey)
      expect(row.priKey).toEqual(myWallet.privateKey)
      expect(row.priKey).not.toEqual(randomPriKey)
    })
  })

  it('generate mnemonic with 24 words', () => {
    const myWallet = walletUtils.walletGenerate()
    expect(myWallet.mnemonic.split(' ').length).toEqual(24)
  })

  it('generate 12-word mnemonic', () => {
    const myWallet = walletUtils.walletGenerate(12)
    expect(myWallet.mnemonic.split(' ').length).toEqual(12)
  })

  it('should read wallet file', async () => {
    for (const row of wallets.wallets) {
      const imported = walletUtils.walletImport(row.mnemonic)
      const opened = await walletUtils.walletOpen(row.password, JSON.stringify(row.file))

      expect(imported.address).toEqual(opened.address)
      expect(imported.publicKey).toEqual(opened.publicKey)
      expect(imported.privateKey).toEqual(opened.privateKey)
      expect(imported.seed).toEqual(opened.seed)
      expect(imported.mnemonic).toEqual(opened.mnemonic)
    }
  })

  it('should throw error if mnemonic is invalid', () => {
    const invalidMnemonic =
      'dog window beach above tiger attract barrel noodle autumn grain update either twelve security shoe teach quote flip reflect maple bike polar ivory gadget'
    expect(() => walletUtils.walletImport(invalidMnemonic)).toThrow('Invalid seed phrase')
  })

  it('should throw error if private key is missing', () => {
    const importedWallet = wallets.wallets[0]
    const seed = Buffer.from(importedWallet.seed, 'hex')
    const neutered = bip32.fromSeed(seed).neutered()
    const mockedDerivePath = jest.fn()
    neutered.derivePath = mockedDerivePath
    mockedDerivePath.mockReturnValue({ privateKey: undefined })

    jest.spyOn(bip32, 'fromSeed').mockImplementationOnce(() => neutered)

    expect(() => walletUtils.walletImport(importedWallet.mnemonic)).toThrow('Missing private key')
  })

  describe('should derive a new address', () => {
    const masterKey = walletUtils.walletImport(wallets.wallets[0].mnemonic).masterKey
    const { hash: existingAddress, index: existingAddressIndex } = walletUtils.deriveNewAddressData(masterKey)

    it('in a random group', () => {
      let newAddressData = walletUtils.deriveNewAddressData(masterKey)
      expect(newAddressData.hash).toEqual(existingAddress)
      newAddressData = walletUtils.deriveNewAddressData(masterKey, undefined, undefined, [existingAddressIndex])
      expect(newAddressData.hash).not.toEqual(existingAddress)
    })

    it('in a specific group', () => {
      const validGroups = Array.from(Array(TOTAL_NUMBER_OF_GROUPS).keys()) // [0, 1, 2, ..., TOTAL_NUMBER_OF_GROUPS - 1]
      validGroups.forEach((validGroup) => {
        const newAddressData = walletUtils.deriveNewAddressData(masterKey, validGroup, undefined, [
          existingAddressIndex
        ])
        const groupOfNewAddress = addressToGroup(newAddressData.hash, TOTAL_NUMBER_OF_GROUPS)
        expect(groupOfNewAddress).toEqual(validGroup)
        expect(newAddressData.hash).not.toEqual(existingAddress)
      })

      const invalidGroups = [-1, TOTAL_NUMBER_OF_GROUPS, TOTAL_NUMBER_OF_GROUPS + 1, -0.1, 0.1, 1e18, -1e18]
      invalidGroups.forEach((invalidGroup) => {
        expect(() =>
          walletUtils.deriveNewAddressData(masterKey, invalidGroup, undefined, [existingAddressIndex])
        ).toThrowError('Invalid group number')
      })
    })

    it('of a specific path index', () => {
      expect(walletUtils.getPath()).toEqual("m/44'/1234'/0'/0/0")
      expect(walletUtils.getPath(0)).toEqual("m/44'/1234'/0'/0/0")
      expect(walletUtils.getPath(1)).toEqual("m/44'/1234'/0'/0/1")
      expect(walletUtils.getPath(2)).toEqual("m/44'/1234'/0'/0/2")
      expect(walletUtils.getPath(3)).toEqual("m/44'/1234'/0'/0/3")
      expect(walletUtils.getPath(3)).toEqual("m/44'/1234'/0'/0/3")
      expect(walletUtils.getPath(4)).toEqual("m/44'/1234'/0'/0/4")
      expect(walletUtils.getPath(9999)).toEqual("m/44'/1234'/0'/0/9999")
      expect(walletUtils.getPath(1e18)).toEqual("m/44'/1234'/0'/0/1000000000000000000")
      expect(() => walletUtils.getPath(-1)).toThrowError('Invalid address index path level')
      expect(() => walletUtils.getPath(0.1)).toThrowError('Invalid address index path level')
      expect(() => walletUtils.getPath(-0.1)).toThrowError('Invalid address index path level')
      expect(() => walletUtils.getPath(1e21)).toThrowError('Invalid address index path level')
      expect(() => walletUtils.getPath(1e-21)).toThrowError('Invalid address index path level')
      expect(() => walletUtils.getPath(1e-18)).toThrowError('Invalid address index path level')
    })
  })

  describe('should call custom functions', () => {
    const walletUtilsRewire = rewire('../dist/wallet')
    const _pbkdf2 = walletUtilsRewire.__get__('_pbkdf2')

    it('getWalletFromMnemonicAsyncUnsafe should call custom mnemonicToSeed function', async () => {
      const mnemonic = wallets.wallets[0].mnemonic
      const mnemonicToSeedCustomFunc = jest.fn((m: string) => Promise.resolve(bip39.mnemonicToSeedSync(m)))
      const spy = jest.spyOn(walletUtils, 'getWalletFromSeed')
      await walletUtils.getWalletFromMnemonicAsyncUnsafe(mnemonicToSeedCustomFunc, mnemonic)
      expect(spy).toHaveBeenCalled()
      expect(mnemonicToSeedCustomFunc.mock.calls.length).toBe(1)
    })
    it('walletGenerateAsyncUnsafe should call custom mnemonicToSeed function', async () => {
      const mnemonicToSeedCustomFunc = jest.fn((m: string) => Promise.resolve(bip39.mnemonicToSeedSync(m)))
      const spy = jest.spyOn(walletUtils, 'getWalletFromSeed')
      await walletUtils.walletGenerateAsyncUnsafe(mnemonicToSeedCustomFunc)
      expect(spy).toHaveBeenCalled()
      expect(mnemonicToSeedCustomFunc.mock.calls.length).toBe(1)
    })
    it('walletImportAsyncUnsafe should call custom mnemonicToSeed function', async () => {
      const mnemonic = wallets.wallets[0].mnemonic
      const mnemonicToSeedCustomFunc = jest.fn((m: string) => Promise.resolve(bip39.mnemonicToSeedSync(m)))
      const spy = jest.spyOn(walletUtils, 'getWalletFromSeed')
      await walletUtils.walletImportAsyncUnsafe(mnemonicToSeedCustomFunc, mnemonic)
      expect(spy).toHaveBeenCalled()
      expect(mnemonicToSeedCustomFunc.mock.calls.length).toBe(1)
    })
    it('walletImportAsyncUnsafe should fail on bad mnemonic', async () => {
      const mnemonic = wallets.wallets[0].mnemonic + 'soatehustaohsutah'
      const mnemonicToSeedCustomFunc = jest.fn((m: string) => Promise.resolve(bip39.mnemonicToSeedSync(m)))
      await walletUtils.walletImportAsyncUnsafe(mnemonicToSeedCustomFunc, mnemonic).catch((e) => {
        expect(e).toStrictEqual(new Error('Invalid seed phrase'))
      })
    })
    it('walletOpenAsyncUnsafe should call custom mnemonicToSeed and pbkdf2 function', async () => {
      const wallet = wallets.wallets[0]
      const password = wallet.password
      const encryptedWallet = JSON.stringify(wallet.file)
      const mnemonicToSeedCustomFunc = jest.fn((m: string) => Promise.resolve(bip39.mnemonicToSeedSync(m)))
      const pbkdf2CustomFunc = jest.fn((p: string, s: Buffer) => _pbkdf2(p, s))
      await walletUtils.walletOpenAsyncUnsafe(password, encryptedWallet, pbkdf2CustomFunc, mnemonicToSeedCustomFunc)
      expect(mnemonicToSeedCustomFunc.mock.calls.length).toBe(1)
      expect(pbkdf2CustomFunc.mock.calls.length).toBe(1)
    })
    it('walletEncryptAsyncUnsafe should call custom pbkdf2 function', async () => {
      const wallet = wallets.wallets[0]
      const mnemonic = wallet.mnemonic
      const password = wallet.password
      const pbkdf2CustomFunc = jest.fn((p: string, s: Buffer) => _pbkdf2(p, s))
      await walletUtils.walletEncryptAsyncUnsafe(password, mnemonic, pbkdf2CustomFunc)
      expect(pbkdf2CustomFunc.mock.calls.length).toBe(1)
    })
  })
  describe('the default pbkdf2 function', () => {
    const walletUtilsRewire = rewire('../dist/wallet')
    const _pbkdf2 = walletUtilsRewire.__get__('_pbkdf2')

    it('should reject when giving an error', async () => {
      const wallet = wallets.wallets[0]
      const salt = wallet.file.salt
      const password = wallet.password
      await _pbkdf2(password, Buffer.from(salt, 'base64')).catch(() => {
        expect(true).toBe(true)
      })
    })
  })
})
