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

import { AddressHash } from '@alephium/shared'
import { addressToGroup, bs58, ExplorerProvider, sign, TOTAL_NUMBER_OF_GROUPS, transactionSign } from '@alephium/web3'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import blake from 'blakejs'

import { findNextAvailableAddressIndex, isAddressIndexValid } from './address'
import {
  dangerouslyConvertBufferMnemonicToString,
  decryptMnemonic,
  DecryptMnemonicResult,
  MnemonicLength
} from './wallet'

export type NonSensitiveAddressData = {
  hash: AddressHash
  index: number
  publicKey: string
}

type SensitiveAddressData = NonSensitiveAddressData & {
  privateKey: Buffer
}

type GenerateAddressProps = {
  group?: number
  addressIndex?: number
  skipAddressIndexes?: number[]
}

class Keyring {
  private hdPath = "m/44'/1234'/0'/0"
  private root: bip32.BIP32Interface | null
  private addresses: SensitiveAddressData[]

  constructor() {
    this.addresses = []
    this.root = null
  }

  // PUBLIC METHODS

  public clearCachedSecrets = () => {
    this.addresses = []
    this.root = null
  }

  public generateRandomMnemonic = (mnemonicLength: MnemonicLength = 24): Buffer => {
    const strength = mnemonicLength === 24 ? 256 : 128
    const mnemonic = Buffer.from(bip39.generateMnemonic(strength))

    this._initFromMnemonic(mnemonic, '')

    return mnemonic
  }

  public importMnemonicString = (mnemonicStr: string): Buffer => {
    if (!mnemonicStr) throw new Error('Keyring: Cannot import mnemonic, mnemonic not provided')

    const mnemonic = Buffer.from(mnemonicStr)

    this.clearCachedSecrets()
    this._initFromMnemonic(Buffer.from(mnemonic), '')

    return mnemonic
  }

  public initFromEncryptedMnemonic = (encryptedMnemonic: string, password: string, passphrase: string) => {
    let result: DecryptMnemonicResult | null = decryptMnemonic(encryptedMnemonic, password)
    const version = result.version

    this.clearCachedSecrets()
    this._initFromMnemonic(result.decryptedMnemonic, passphrase)

    encryptedMnemonic = ''
    password = ''
    passphrase = ''
    result = null

    return version
  }

  public generateAndCacheAddress = (props: GenerateAddressProps): NonSensitiveAddressData =>
    this._getNonSensitiveAddressData(this._generateAndCacheAddress(props))

  public signTransaction = (txId: string, addressHash: AddressHash): string =>
    transactionSign(txId, this.exportPrivateKeyOfAddress(addressHash).toString('hex'))

  public signMessage = (message: string, addressHash: AddressHash): string =>
    sign(message, this.exportPrivateKeyOfAddress(addressHash).toString('hex'))

  public exportPrivateKeyOfAddress = (addressHash: AddressHash): SensitiveAddressData['privateKey'] =>
    this._getAddress(addressHash).privateKey

  public discoverAndCacheActiveAddresses = async (
    client: ExplorerProvider,
    addressIndexesToSkip: number[] = [],
    minGap = 5
  ): Promise<NonSensitiveAddressData[]> => {
    const addressesPerGroup = Array.from({ length: TOTAL_NUMBER_OF_GROUPS }, (): SensitiveAddressData[] => [])
    const activeAddresses: SensitiveAddressData[] = []
    const skipIndexes = Array.from(addressIndexesToSkip)

    for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group++) {
      const newAddresses = this._deriveAddressesInGroup(group, minGap, skipIndexes)
      addressesPerGroup[group] = newAddresses
      skipIndexes.push(...newAddresses.map((address) => address.index))
    }

    const addressesToCheckIfActive = addressesPerGroup.flat().map((address) => address.hash)
    const results = await getActiveAddressesResults(addressesToCheckIfActive, client)
    const resultsPerGroup = splitResultsArrayIntoOneArrayPerGroup(results, minGap)

    for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group++) {
      const { gap, activeAddresses: newActiveAddresses } = getGapFromLastActiveAddress(
        addressesPerGroup[group],
        resultsPerGroup[group]
      )

      let gapPerGroup = gap
      activeAddresses.push(...newActiveAddresses)

      while (gapPerGroup < minGap) {
        const remainingGap = minGap - gapPerGroup
        const newAddresses = this._deriveAddressesInGroup(group, remainingGap, skipIndexes)
        skipIndexes.push(...newAddresses.map((address) => address.index))

        const addressesToCheckIfActive = newAddresses.map((address) => address.hash)
        const results = await getActiveAddressesResults(addressesToCheckIfActive, client)

        const { gap, activeAddresses: newActiveAddresses } = getGapFromLastActiveAddress(
          newAddresses,
          results,
          gapPerGroup
        )
        gapPerGroup = gap
        activeAddresses.push(...newActiveAddresses)
      }
    }

    this.addresses = [...this.addresses, ...activeAddresses]

    return activeAddresses.map(this._getNonSensitiveAddressData)
  }

  // PRIVATE METHODS

  private _getAddress = (addressHash: AddressHash): SensitiveAddressData => {
    const address = this.addresses.find(({ hash }) => hash === addressHash)

    if (!address) throw new Error(`Keyring: Could not find address with hash ${addressHash}`)

    return address
  }

  private _generateAndCacheAddress = (props: GenerateAddressProps): SensitiveAddressData => {
    const cachedAddress = this.addresses.find(({ index }) => index === props.addressIndex)

    if (cachedAddress) return cachedAddress

    const address = this._generateAddress(props)

    this.addresses.push(address)

    return address
  }

  private _generateAddress = ({
    group,
    addressIndex = 0,
    skipAddressIndexes = []
  }: GenerateAddressProps): SensitiveAddressData => {
    if (group !== undefined && (!Number.isInteger(group) || group < 0 || group >= TOTAL_NUMBER_OF_GROUPS))
      throw new Error(`Keyring: Could not generate address in group ${group}, group is invalid`)

    let nextAddressIndex = skipAddressIndexes.includes(addressIndex)
      ? findNextAvailableAddressIndex(addressIndex, skipAddressIndexes)
      : addressIndex
    let newAddressData = this._deriveAddressAndKeys(nextAddressIndex)

    while (group !== undefined && addressToGroup(newAddressData.hash, TOTAL_NUMBER_OF_GROUPS) !== group) {
      nextAddressIndex = findNextAvailableAddressIndex(newAddressData.index, skipAddressIndexes)
      newAddressData = this._deriveAddressAndKeys(nextAddressIndex)
    }

    return newAddressData
  }

  private _deriveAddressesInGroup = (group: number, amount: number, skipIndexes: number[]): SensitiveAddressData[] => {
    const addresses = []
    const skipAddressIndexes = Array.from(skipIndexes)

    for (let j = 0; j < amount; j++) {
      const newAddress = this._generateAddress({ group, skipAddressIndexes })
      addresses.push(newAddress)
      skipAddressIndexes.push(newAddress.index)
    }

    return addresses
  }

  private _getNonSensitiveAddressData = ({
    hash,
    index,
    publicKey
  }: SensitiveAddressData): NonSensitiveAddressData => ({ hash, index, publicKey })

  private _initFromMnemonic = (mnemonic: Buffer | null, passphrase: string) => {
    if (this.root) throw new Error('Keyring: Secret recovery phrase already provided')
    if (!mnemonic) throw new Error('Keyring: Secret recovery phrase not provided')

    const isValid = bip39.validateMnemonic(dangerouslyConvertBufferMnemonicToString(mnemonic))
    if (!isValid) throw new Error('Keyring: Invalid secret recovery phrase provided')

    const seed = bip39.mnemonicToSeedSync(dangerouslyConvertBufferMnemonicToString(mnemonic), passphrase)
    this.root = bip32.fromSeed(seed)

    passphrase = ''
    mnemonic = null
  }

  private _getPath = (addressIndex: number = 0) => {
    if (!isAddressIndexValid(addressIndex)) throw new Error('Invalid address index path level')

    return `${this.hdPath}/${addressIndex}`
  }

  private _deriveAddressAndKeys = (addressIndex: number): SensitiveAddressData => {
    if (!this.root) throw new Error('Keyring: Cannot derive address and keys, secret recovery phrase is not provided')

    const keyPair = this.root.derivePath(this._getPath(addressIndex))

    if (!keyPair.privateKey) throw new Error('Keyring: Missing private key')

    const publicKey = keyPair.publicKey.toString('hex')
    const privateKey = keyPair.privateKey
    const hash = blake.blake2b(Uint8Array.from(keyPair.publicKey), undefined, 32)
    const pkhash = Buffer.from(hash)
    const type = Buffer.from([0])
    const bytes = Buffer.concat([type, pkhash])
    const address = bs58.encode(bytes)

    return { hash: address, publicKey, privateKey, index: addressIndex }
  }
}

export const keyring = new Keyring()

const splitResultsArrayIntoOneArrayPerGroup = (array: boolean[], chunkSize: number): boolean[][] => {
  const chunks = []
  let i = 0

  while (i < array.length) {
    chunks.push(array.slice(i, i + chunkSize))
    i += chunkSize
  }

  return chunks
}

const getGapFromLastActiveAddress = (
  addresses: SensitiveAddressData[],
  results: boolean[],
  startingGap = 0
): { gap: number; activeAddresses: SensitiveAddressData[] } => {
  let gap = startingGap
  const activeAddresses = []

  for (let j = 0; j < addresses.length; j++) {
    const address = addresses[j]
    const isActive = results[j]

    if (isActive) {
      activeAddresses.push(address)
      gap = 0
    } else {
      gap++
    }
  }

  return {
    gap,
    activeAddresses
  }
}

const getActiveAddressesResults = async (
  addressesToCheckIfActive: string[],
  client: ExplorerProvider
): Promise<boolean[]> => {
  const QUERY_LIMIT = 80
  const results: boolean[] = []
  let queryPage = 0

  while (addressesToCheckIfActive.length > results.length) {
    const addressesToQuery = addressesToCheckIfActive.slice(queryPage * QUERY_LIMIT, ++queryPage * QUERY_LIMIT)
    const response = await client.addresses.postAddressesUsed(addressesToQuery)

    results.push(...response)
  }

  return results
}
