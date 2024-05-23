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

import {
  AddressHash,
  bip39Words,
  findNextAvailableAddressIndex,
  isAddressIndexValid,
  resetArray
} from '@alephium/shared'
import { bs58, groupOfAddress, sign, TOTAL_NUMBER_OF_GROUPS, transactionSign } from '@alephium/web3'
import * as metamaskBip39 from '@metamask/scure-bip39'
import blake from 'blakejs'
import { HDKey } from 'ethereum-cryptography/hdkey'
import { bytesToHex } from 'ethereum-cryptography/utils'

import { decryptMnemonic, MnemonicLength, mnemonicStringToUint8Array } from '@/mnemonic'

export type NonSensitiveAddressData = {
  hash: AddressHash
  index: number
  publicKey: string
}

type SensitiveAddressData = NonSensitiveAddressData & {
  privateKey: Uint8Array
}

type NullableSensitiveAddressData = NonSensitiveAddressData & {
  privateKey: Uint8Array | null
}

type GenerateAddressProps = {
  group?: number
  addressIndex?: number
  skipAddressIndexes?: number[]
}

export class Keyring {
  private hdPath = "m/44'/1234'/0'/0"
  private hdWallet: HDKey | null
  private root: HDKey | null
  private addresses: NullableSensitiveAddressData[]

  constructor() {
    this.addresses = []
    this.hdWallet = null
    this.root = null
  }

  // PUBLIC METHODS

  public clearCachedSecrets = () => {
    this.addresses.forEach((address) => {
      if (address.privateKey) {
        resetArray(address.privateKey)
        address.privateKey = null
      }
    })

    this.hdWallet = null
    this.root = null
  }

  public clearAll = () => {
    this.clearCachedSecrets()
    this.addresses = []
  }

  public generateRandomMnemonic = (mnemonicLength: MnemonicLength = 24): Uint8Array => {
    const strength = mnemonicLength === 24 ? 256 : 128
    const mnemonic = metamaskBip39.generateMnemonic(bip39Words, strength)

    this._initFromMnemonic(mnemonic, '')

    return mnemonic
  }

  public importMnemonicString = (mnemonicStr: string): Uint8Array => {
    if (!mnemonicStr) throw new Error('Keyring: Cannot import mnemonic, mnemonic not provided')

    if (!metamaskBip39.validateMnemonic(mnemonicStr, bip39Words))
      throw new Error('Keyring: Cannot import mnemonic, invalid mnemonic provided')

    const mnemonic = mnemonicStringToUint8Array(mnemonicStr)

    this.clearAll()
    this._initFromMnemonic(mnemonic, '')

    return mnemonic
  }

  public initFromDecryptedMnemonic = async (decryptedMnemonic: Uint8Array, passphrase: string) => {
    this.clearAll()
    this._initFromMnemonic(decryptedMnemonic, passphrase)

    passphrase = ''
    resetArray(decryptedMnemonic)
  }

  public initFromEncryptedMnemonic = async (encryptedMnemonic: string, password: string, passphrase: string) => {
    const { version, decryptedMnemonic } = await decryptMnemonic(encryptedMnemonic, password)

    this.clearAll()
    this._initFromMnemonic(decryptedMnemonic, passphrase)

    encryptedMnemonic = ''
    password = ''
    passphrase = ''
    resetArray(decryptedMnemonic)

    return version
  }

  public generateAndCacheAddress = (props: GenerateAddressProps): NonSensitiveAddressData =>
    this._getNonSensitiveAddressData(this._generateAndCacheAddress(props))

  public signTransaction = (txId: string, addressHash: AddressHash): string =>
    transactionSign(txId, this.exportPrivateKeyOfAddress(addressHash))

  public signMessageHash = (messageHash: string, addressHash: AddressHash): string =>
    sign(messageHash, this.exportPrivateKeyOfAddress(addressHash))

  public exportPrivateKeyOfAddress = (addressHash: AddressHash): string => {
    const address = this._getAddress(addressHash)

    if (!address.privateKey) {
      address.privateKey = this._deriveAddressAndKeys(address.index).privateKey
    }

    return bytesToHex(address.privateKey)
  }

  public isInitialized = () => this.root !== null

  // PRIVATE METHODS

  private _getAddress = (addressHash: AddressHash): NullableSensitiveAddressData => {
    const address = this.addresses.find(({ hash }) => hash === addressHash)

    if (!address) throw new Error(`Keyring: Could not find address with hash ${addressHash}`)

    return address
  }

  private _generateAndCacheAddress = (props: GenerateAddressProps): SensitiveAddressData => {
    const cachedAddress = this.addresses.find(({ index }) => index === props.addressIndex)

    if (cachedAddress) {
      if (!cachedAddress.privateKey) {
        cachedAddress.privateKey = this._deriveAddressAndKeys(cachedAddress.index).privateKey
      }

      return cachedAddress as SensitiveAddressData
    }

    const address = this._generateAddress(props)

    this.addresses.push(address)

    return address
  }

  private _generateAddress = ({
    group,
    addressIndex,
    skipAddressIndexes = []
  }: GenerateAddressProps): SensitiveAddressData => {
    if (group !== undefined && (!Number.isInteger(group) || group < 0 || group >= TOTAL_NUMBER_OF_GROUPS))
      throw new Error(`Keyring: Could not generate address in group ${group}, group is invalid`)

    if (addressIndex !== undefined) {
      if (!Number.isInteger(addressIndex) || addressIndex < 0)
        throw new Error(`Keyring: Could not generate address, ${addressIndex} is not a valid addressIndex`)

      if (group !== undefined || skipAddressIndexes.length > 0)
        throw new Error(
          'Keyring: Could not generate address, invalid arguments passed: when addressIndex is provided the group and skipAddressIndexes should not be provided.'
        )

      return this._deriveAddressAndKeys(addressIndex)
    }

    const initialAddressIndex = 0

    let nextAddressIndex = skipAddressIndexes.includes(initialAddressIndex)
      ? findNextAvailableAddressIndex(initialAddressIndex, skipAddressIndexes)
      : initialAddressIndex
    let newAddressData = this._deriveAddressAndKeys(nextAddressIndex)

    while (group !== undefined && groupOfAddress(newAddressData.hash) !== group) {
      nextAddressIndex = findNextAvailableAddressIndex(newAddressData.index, skipAddressIndexes)
      newAddressData = this._deriveAddressAndKeys(nextAddressIndex)
    }

    return newAddressData
  }

  private _getNonSensitiveAddressData = ({
    hash,
    index,
    publicKey
  }: SensitiveAddressData): NonSensitiveAddressData => ({ hash, index, publicKey })

  private _initFromMnemonic = (mnemonic: Uint8Array | null, passphrase: string) => {
    if (this.root) throw new Error('Keyring: Secret recovery phrase already provided')
    if (!mnemonic) throw new Error('Keyring: Secret recovery phrase not provided')

    const seed = metamaskBip39.mnemonicToSeedSync(mnemonic, bip39Words, passphrase)
    this.hdWallet = HDKey.fromMasterSeed(seed)
    this.root = this.hdWallet.derive(this.hdPath)

    passphrase = ''
  }

  private _deriveAddressAndKeys = (addressIndex: number): SensitiveAddressData => {
    if (!this.root) throw new Error('Keyring: Cannot derive address and keys, secret recovery phrase is not provided')
    if (!isAddressIndexValid(addressIndex)) throw new Error('Invalid address index path level')

    const keyPair = this.root.deriveChild(addressIndex)

    if (!keyPair.publicKey) throw new Error('Keyring: Missing public key')
    if (!keyPair.privateKey) throw new Error('Keyring: Missing private key')

    const publicKey = bytesToHex(keyPair.publicKey)
    const privateKey = keyPair.privateKey
    const hash = blake.blake2b(Uint8Array.from(keyPair.publicKey), undefined, 32)
    const type = new Uint8Array([0])
    const bytes = new Uint8Array(type.length + hash.length)
    bytes.set(type, 0)
    bytes.set(hash, type.length)
    const address = bs58.encode(bytes)

    return { hash: address, publicKey, privateKey, index: addressIndex }
  }
}

export const keyring = new Keyring()
