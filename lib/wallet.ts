/*
Copyright 2018 - 2022 The Alephium Authors
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

import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import blake from 'blakejs'
import { pbkdf2 } from 'crypto'

import bs58 from './bs58'
import { decrypt, decryptAsync, encrypt, encryptAsync, Pbkdf2Function } from './password-crypto'
import { TOTAL_NUMBER_OF_GROUPS } from './constants'
import { addressToGroup } from './address'

type MnemonicToSeedFunction = (mnemonic: string, passphrase?: string) => Promise<Buffer>

class StoredState {
  readonly version = 1
  readonly mnemonic: string

  constructor({ mnemonic }: { mnemonic: string }) {
    this.mnemonic = mnemonic
  }
}

type WalletProps = {
  address: string
  publicKey: string
  privateKey: string
  seed: Buffer
  mnemonic: string
}

export class Wallet {
  readonly address: string
  readonly publicKey: string
  readonly privateKey: string
  readonly seed: Buffer // TODO: We should differentiate the notion of account (seed, mnemonic) from individual addresses.
  readonly mnemonic: string

  constructor({ address, publicKey, privateKey, seed, mnemonic }: WalletProps) {
    this.address = address
    this.publicKey = publicKey
    this.privateKey = privateKey
    this.seed = seed
    this.mnemonic = mnemonic
  }

  encrypt = (password: string) => walletEncrypt(password, this.mnemonic)
}

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

export const getWalletFromSeed = (seed: Buffer, mnemonic: string): Wallet => {
  const { address, publicKey, privateKey } = deriveAddressAndKeys(seed)

  return new Wallet({ seed, address, publicKey, privateKey, mnemonic })
}

export const getWalletFromMnemonic = (mnemonic: string, passphrase = ''): Wallet => {
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase)

  return getWalletFromSeed(seed, mnemonic)
}

export const getWalletFromMnemonicAsyncUnsafe = async (
  mnemonicToSeedCustomFunc: MnemonicToSeedFunction,
  mnemonic: string,
  passphrase = ''
): Promise<Wallet> => {
  const seed = await mnemonicToSeedCustomFunc(mnemonic, passphrase)

  return getWalletFromSeed(seed, mnemonic)
}

export type AddressAndKeys = {
  address: string
  publicKey: string
  privateKey: string
  addressIndex: number
}

const deriveAddressAndKeys = (seed: Buffer, addressIndex?: number): AddressAndKeys => {
  const masterKey = bip32.fromSeed(seed)
  const keyPair = masterKey.derivePath(getPath(addressIndex))

  if (!keyPair.privateKey) throw new Error('Missing private key')

  const publicKey = keyPair.publicKey.toString('hex')
  const privateKey = keyPair.privateKey.toString('hex')

  const hash = blake.blake2b(Uint8Array.from(Buffer.from(publicKey, 'hex')), undefined, 32)

  const pkhash = Buffer.from(hash)
  const type = Buffer.from([0])
  const bytes = Buffer.concat([type, pkhash])
  const address = bs58.encode(bytes)

  return { address, publicKey, privateKey, addressIndex: addressIndex || 0 }
}

const findNextAvailableAddressIndex = (startIndex: number, skipIndexes: number[] = []) => {
  let nextAvailableAddressIndex = startIndex

  do {
    nextAvailableAddressIndex++
  } while (skipIndexes.includes(nextAvailableAddressIndex))

  return nextAvailableAddressIndex
}

export const deriveNewAddressData = (
  seed: Buffer,
  forGroup?: number,
  addressIndex?: number,
  skipAddressIndexes: number[] = []
): AddressAndKeys => {
  if (forGroup !== undefined && (forGroup >= TOTAL_NUMBER_OF_GROUPS || forGroup < 0 || !Number.isInteger(forGroup))) {
    throw new Error('Invalid group number')
  }

  const initialAddressIndex = addressIndex || 0

  let nextAddressIndex = skipAddressIndexes.includes(initialAddressIndex)
    ? findNextAvailableAddressIndex(initialAddressIndex, skipAddressIndexes)
    : initialAddressIndex
  let newAddressData = deriveAddressAndKeys(seed, nextAddressIndex)

  while (forGroup !== undefined && addressToGroup(newAddressData.address, TOTAL_NUMBER_OF_GROUPS) !== forGroup) {
    nextAddressIndex = findNextAvailableAddressIndex(newAddressData.addressIndex, skipAddressIndexes)
    newAddressData = deriveAddressAndKeys(seed, nextAddressIndex)
  }

  return newAddressData
}

export const walletGenerate = (passphrase?: string) => {
  const mnemonic = bip39.generateMnemonic(256)

  return getWalletFromMnemonic(mnemonic, passphrase)
}

export const walletGenerateAsyncUnsafe = (mnemonicToSeedCustomFunc: MnemonicToSeedFunction, passphrase?: string) => {
  const mnemonic = bip39.generateMnemonic(256)

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
  const config = JSON.parse(dataDecrypted) as StoredState

  return getWalletFromMnemonic(config.mnemonic)
}

export const walletEncrypt = (password: string, mnemonic: string) => {
  const storedState = new StoredState({
    mnemonic
  })

  return encrypt(password, JSON.stringify(storedState))
}

export const _pbkdf2 = (password: string, salt: Buffer): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, 10000, 32, 'sha256', (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}

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
  const config = JSON.parse(data) as StoredState

  return getWalletFromMnemonicAsyncUnsafe(mnemonicToSeedCustomFunc, config.mnemonic)
}

export const walletEncryptAsyncUnsafe = (
  password: string,
  mnemonic: string,
  pbkdf2CustomFunc: Pbkdf2Function
): Promise<string> => {
  const storedState = new StoredState({
    mnemonic
  })

  return encryptAsync(password, JSON.stringify(storedState), pbkdf2CustomFunc ?? _pbkdf2)
}
