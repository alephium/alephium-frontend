// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import * as bip32 from 'bip32'
import * as bip39 from 'bip39'

import bs58 from './bs58'

import blake from 'blakejs'

import { decrypt, encrypt } from './password-crypto'

type NetworkId = 0 | 1 // 0 = mainnet, 1 = testnet

class StoredState {
  numberOfAddresses: number
  activeAddressIndex: number
  seed?: string
  mnemonic?: string

  constructor({
    numberOfAddresses,
    activeAddressIndex,
    seed,
    mnemonic
  }: {
    numberOfAddresses: number
    activeAddressIndex: number
    seed?: Buffer
    mnemonic?: string
  }) {
    this.numberOfAddresses = numberOfAddresses
    this.activeAddressIndex = activeAddressIndex

    if (mnemonic) {
      this.mnemonic = mnemonic
    } else if (seed) {
      this.seed = seed.toString('hex')
    } else {
      throw new Error('Missing both seed and mnemonic. One of the two must be defined.')
    }
  }
}

type WalletWithMnemonic = Wallet & { mnemonic: string }

export class Wallet {
  address: string
  publicKey: string
  privateKey: string
  seed: Buffer // TODO: We should differentiate the notion of account (seed, mnemonic) from individual addresses.
  mnemonic?: string

  constructor({
    address,
    publicKey,
    privateKey,
    seed,
    mnemonic
  }: {
    address: string
    publicKey: string
    privateKey: string
    seed: Buffer
    mnemonic?: string
  }) {
    this.address = address
    this.publicKey = publicKey
    this.privateKey = privateKey
    this.seed = seed

    if (mnemonic) {
      this.mnemonic = mnemonic
    }
  }

  encrypt = (password: string) => {
    const storedState = new StoredState({
      numberOfAddresses: 1,
      activeAddressIndex: 0,
      seed: this.seed,
      mnemonic: this.mnemonic
    })
    return encrypt(password, JSON.stringify(storedState))
  }
}

const path = (networkId: NetworkId) => {
  let coinType = ''

  switch (networkId) {
    case 0:
      coinType = "1234'"
      break
    case 1:
      coinType = "1'"
      break
  }

  return `m/44'/${coinType}/0'/0/0`
}

export const getWalletFromMnemonic = (mnemonic: string, networkId: NetworkId) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const { address, publicKey, privateKey } = deriveAddressAndKeys(seed, networkId)

  return new Wallet({ seed, address, publicKey, privateKey, mnemonic }) as WalletWithMnemonic
}

export const getWalletFromSeed = (seed: Buffer, networkId: NetworkId) => {
  const { address, publicKey, privateKey } = deriveAddressAndKeys(seed, networkId)

  return new Wallet({ seed, address, publicKey, privateKey })
}

const deriveAddressAndKeys = (seed: Buffer, networkId: NetworkId) => {
  const masterKey = bip32.fromSeed(seed)
  const keyPair = masterKey.derivePath(path(networkId))

  if (!keyPair.privateKey) throw new Error('Missing private key')

  const publicKey = keyPair.publicKey.toString('hex')
  const privateKey = keyPair.privateKey.toString('hex')

  const context = blake.blake2bInit(32)
  blake.blake2bUpdate(context, Buffer.from(publicKey, 'hex'))
  const hash = blake.blake2bFinal(context)

  const pkhash = Buffer.from(hash)
  const type = Buffer.from([0])
  const bytes = Buffer.concat([type, pkhash])
  const address = bs58.encode(bytes)

  return { address, publicKey, privateKey }
}

export const walletGenerate = (networkId: NetworkId) => {
  const mnemonic = bip39.generateMnemonic(256)
  return getWalletFromMnemonic(mnemonic, networkId)
}

export const walletImport = (mnemonic: string, networkId: NetworkId) => {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed phrase.')
  }
  return getWalletFromMnemonic(mnemonic, networkId)
}

export const walletOpen = (password: string, encryptedWallet: string, networkId: NetworkId) => {
  const dataDecrypted = decrypt(password, encryptedWallet)
  const config = JSON.parse(dataDecrypted) as StoredState

  if (config.mnemonic) {
    return getWalletFromMnemonic(config.mnemonic, networkId)
  } else if (config.seed) {
    return getWalletFromSeed(Buffer.from(config.seed, 'hex'), networkId)
  } else {
    throw new Error(
      'Problem with the encrypted wallet: missing both seed and mnemonic. One of the two must be defined.'
    )
  }
}
