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

// @ts-ignore
import blake from 'blakejs'

import { decrypt, encrypt } from './password-crypto'

type NetworkType = 'T' | 'M' | 'D'

class StoredState {
  seed: string
  numberOfAddresses: number
  activeAddressIndex: number

  constructor(seed: Buffer, numberOfAddresses: number, activeAddressIndex: number) {
    this.seed = seed.toString('hex')
    this.numberOfAddresses = numberOfAddresses
    this.activeAddressIndex = activeAddressIndex
  }
}

export class Wallet {
  seed: Buffer
  address: string
  publicKey: string
  privateKey: string

  constructor(seed: Buffer, address: string, publicKey: string, privateKey: string) {
    this.seed = seed
    this.address = address
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  encrypt = (password: string) => {
    // TODO we currently support only 1 address
    const storedState = new StoredState(this.seed, 1, 0)
    return encrypt(password, JSON.stringify(storedState))
  }
}

const path = (networkType: NetworkType) => {
  let coinType = ''

  switch (networkType) {
    case 'M':
      coinType = "1234'"
      break
    case 'T':
      coinType = "1'"
      break
    case 'D':
      coinType = "-1'"
      break
  }

  return `m/44'/${coinType}/0'/0/0`
}

export const fromMnemonic = (mnemonic: string, networkType: NetworkType) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  return fromSeed(seed, networkType)
}

export const fromSeed = (seed: Buffer, networkType: NetworkType) => {
  const masterKey = bip32.fromSeed(seed)
  const keyPair = masterKey.derivePath(path(networkType))

  if (!keyPair.privateKey) throw new Error('Missing private key')

  const publicKey = keyPair.publicKey.toString('hex')
  const privateKey = keyPair.privateKey.toString('hex')

  const context = blake.blake2bInit(32, null)
  blake.blake2bUpdate(context, Buffer.from(publicKey, 'hex'))
  const hash = blake.blake2bFinal(context)

  const pkhash = Buffer.from(hash, 'hex')
  const type = Buffer.from([0])
  const bytes = Buffer.concat([type, pkhash])
  const address = networkType.concat(bs58.encode(bytes))

  return new Wallet(seed, address, publicKey, privateKey)
}

export const walletGenerate = (networkType: NetworkType) => {
  const mnemonic = bip39.generateMnemonic(256)
  return {
    mnemonic: mnemonic,
    wallet: fromMnemonic(mnemonic, networkType)
  }
}

export const walletImport = (seedPhrase: string, networkType: NetworkType) => {
  if (!bip39.validateMnemonic(seedPhrase)) {
    throw new Error('Invalid seed phrase.')
  }
  return fromMnemonic(seedPhrase, networkType)
}

export const walletOpen = (password: string, data: string, networkType: NetworkType) => {
  const dataDecrypted = decrypt(password, data)
  const config = JSON.parse(dataDecrypted)

  return fromSeed(Buffer.from(config.seed, 'hex'), networkType)
}
