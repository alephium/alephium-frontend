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

import { AddressKeyPair } from '@alephium/shared'
import { addressToGroup, bs58, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import blake from 'blakejs'
import { pbkdf2 } from 'crypto'

import { decrypt, decryptAsync, encrypt, encryptAsync, Pbkdf2Function } from './password-crypto'

type MnemonicLength = 12 | 24

type EncryptedMnemonicVersion = 1 | 2

type MnemonicToSeedFunction = (mnemonic: string, passphrase?: string) => Promise<Buffer>

class EncryptedMnemonicStoredAsString {
  readonly version: EncryptedMnemonicVersion = 1
  readonly mnemonic: string

  constructor({ mnemonic }: { mnemonic: string }) {
    this.mnemonic = mnemonic
  }
}

// Deprecated, delete when mobile wallet get adapted
type WalletProps = {
  address: string
  publicKey: string
  privateKey: string
  seed: Buffer
  mnemonic: string
  masterKey: bip32.BIP32Interface
}

// Deprecated, delete when mobile wallet get adapted
export class Wallet {
  readonly address: string
  readonly publicKey: string
  readonly privateKey: string
  readonly seed: Buffer // TODO: We should differentiate the notion of account (seed, mnemonic) from individual addresses.
  readonly mnemonic: string
  readonly masterKey: bip32.BIP32Interface

  constructor({ address, publicKey, privateKey, seed, mnemonic, masterKey }: WalletProps) {
    this.address = address
    this.publicKey = publicKey
    this.privateKey = privateKey
    this.seed = seed
    this.mnemonic = mnemonic
    this.masterKey = masterKey
  }

  encrypt = (password: string) => walletEncrypt(password, this.mnemonic)
}

// Deprecated, delete when mobile wallet get adapted
export const getPath = (addressIndex?: number) => {
  if (
    addressIndex !== undefined &&
    (addressIndex < 0 || !Number.isInteger(addressIndex) || addressIndex.toString().includes('e'))
  ) {
    throw new Error('Invalid address index path level')
  }
  // Being explicit: we always use coinType 1234 no matter the network.
  const coinType = "1234'"

  return `m/44'/${coinType}/0'/0/${addressIndex || '0'}`
}

// Deprecated, delete when mobile wallet get adapted
export const getWalletFromSeed = (seed: Buffer, mnemonic: string): Wallet => {
  const masterKey = bip32.fromSeed(seed)
  const { hash, publicKey, privateKey } = deriveAddressAndKeys(masterKey)

  return new Wallet({ seed, address: hash, publicKey, privateKey, mnemonic, masterKey })
}

// Deprecated, delete when mobile wallet get adapted
export const getWalletFromMnemonic = (mnemonic: string, passphrase = ''): Wallet => {
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase)

  return getWalletFromSeed(seed, mnemonic)
}

// Deprecated, delete when mobile wallet get adapted
export const getWalletFromMnemonicAsyncUnsafe = async (
  mnemonicToSeedCustomFunc: MnemonicToSeedFunction,
  mnemonic: string,
  passphrase = ''
): Promise<Wallet> => {
  const seed = await mnemonicToSeedCustomFunc(mnemonic, passphrase)

  return getWalletFromSeed(seed, mnemonic)
}

// Deprecated, delete when mobile wallet get adapted
export const deriveAddressAndKeys = (masterKey: bip32.BIP32Interface, addressIndex?: number): AddressKeyPair => {
  const keyPair = masterKey.derivePath(getPath(addressIndex))

  if (!keyPair.privateKey) throw new Error('Missing private key')

  const publicKey = keyPair.publicKey.toString('hex')
  const privateKey = keyPair.privateKey.toString('hex')
  const hash = blake.blake2b(Uint8Array.from(keyPair.publicKey), undefined, 32)
  const pkhash = Buffer.from(hash)
  const type = Buffer.from([0])
  const bytes = Buffer.concat([type, pkhash])
  const address = bs58.encode(bytes)

  return { hash: address, publicKey, privateKey, index: addressIndex || 0 }
}

const findNextAvailableAddressIndex = (startIndex: number, skipIndexes: number[] = []) => {
  let nextAvailableAddressIndex = startIndex

  do {
    nextAvailableAddressIndex++
  } while (skipIndexes.includes(nextAvailableAddressIndex))

  return nextAvailableAddressIndex
}

export const deriveNewAddressData = (
  masterKey: bip32.BIP32Interface,
  forGroup?: number,
  addressIndex?: number,
  skipAddressIndexes: number[] = []
): AddressKeyPair => {
  if (forGroup !== undefined && (forGroup >= TOTAL_NUMBER_OF_GROUPS || forGroup < 0 || !Number.isInteger(forGroup))) {
    throw new Error('Invalid group number')
  }

  const initialAddressIndex = addressIndex || 0

  let nextAddressIndex = skipAddressIndexes.includes(initialAddressIndex)
    ? findNextAvailableAddressIndex(initialAddressIndex, skipAddressIndexes)
    : initialAddressIndex
  let newAddressData = deriveAddressAndKeys(masterKey, nextAddressIndex)

  while (forGroup !== undefined && addressToGroup(newAddressData.hash, TOTAL_NUMBER_OF_GROUPS) !== forGroup) {
    nextAddressIndex = findNextAvailableAddressIndex(newAddressData.index, skipAddressIndexes)
    newAddressData = deriveAddressAndKeys(masterKey, nextAddressIndex)
  }

  return newAddressData
}

export const walletGenerate = (mnemonicLength: MnemonicLength = 24, passphrase?: string) => {
  const strength = mnemonicLength === 24 ? 256 : 128
  const mnemonic = bip39.generateMnemonic(strength)

  return getWalletFromMnemonic(mnemonic, passphrase)
}

export const walletGenerateAsyncUnsafe = (
  mnemonicToSeedCustomFunc: MnemonicToSeedFunction,
  mnemonicLength: MnemonicLength = 24,
  passphrase?: string
) => {
  const strength = mnemonicLength === 24 ? 256 : 128
  const mnemonic = bip39.generateMnemonic(strength)

  return getWalletFromMnemonicAsyncUnsafe(mnemonicToSeedCustomFunc, mnemonic, passphrase)
}

export const walletImport = (mnemonic: string, passphrase?: string) => {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed phrase')
  }

  return getWalletFromMnemonic(mnemonic, passphrase)
}

export const walletOpen = (password: string, encryptedWallet: string) => {
  const dataDecrypted = decrypt(password, encryptedWallet)
  const config = JSON.parse(dataDecrypted) as EncryptedMnemonicStoredAsString

  return getWalletFromMnemonic(config.mnemonic)
}

export const walletEncrypt = (password: string, mnemonic: string) => {
  const storedState = new EncryptedMnemonicStoredAsString({
    mnemonic
  })

  return encrypt(password, JSON.stringify(storedState))
}

const _pbkdf2 = (password: string, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    pbkdf2(password, salt, 10000, 32, 'sha256', (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })

export const walletImportAsyncUnsafe = async (
  mnemonicToSeedCustomFunc: MnemonicToSeedFunction,
  mnemonic: string,
  passphrase?: string
) => {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed phrase')
  }

  return getWalletFromMnemonicAsyncUnsafe(mnemonicToSeedCustomFunc, mnemonic, passphrase)
}

export const walletOpenAsyncUnsafe = async (
  password: string,
  encryptedWallet: string,
  pbkdf2CustomFunc: Pbkdf2Function,
  mnemonicToSeedCustomFunc: MnemonicToSeedFunction
): Promise<Wallet> => {
  const data = await decryptAsync(password, encryptedWallet, pbkdf2CustomFunc ?? _pbkdf2)
  const config = JSON.parse(data) as EncryptedMnemonicStoredAsString

  return getWalletFromMnemonicAsyncUnsafe(mnemonicToSeedCustomFunc, config.mnemonic)
}

export const walletEncryptAsyncUnsafe = (
  password: string,
  mnemonic: string,
  pbkdf2CustomFunc: Pbkdf2Function
): Promise<string> => {
  const storedState = new EncryptedMnemonicStoredAsString({
    mnemonic
  })

  return encryptAsync(password, JSON.stringify(storedState), pbkdf2CustomFunc ?? _pbkdf2)
}
