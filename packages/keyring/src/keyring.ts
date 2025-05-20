import {
  AddressHash,
  bip39Words,
  findNextAvailableAddressIndex,
  isAddressIndexValid,
  resetArray
} from '@alephium/shared'
import { bs58, groupOfAddress, sign, TOTAL_NUMBER_OF_GROUPS, transactionSign } from '@alephium/web3'
import { getHDWalletPath } from '@alephium/web3-wallet'
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

export type NonSensitiveAddressDataWithGroup = NonSensitiveAddressData & { group: number }

type SensitiveAddressData = NonSensitiveAddressData & {
  privateKey: Uint8Array
}

type NullableSensitiveAddressData = NonSensitiveAddressData & {
  privateKey: Uint8Array | null
}

export type GenerateAddressProps = {
  group?: number
  addressIndex?: number
  skipAddressIndexes?: number[]
}

export class Keyring {
  private hdWallet: HDKey | null
  private addresses: NullableSensitiveAddressData[]

  constructor() {
    this.addresses = []
    this.hdWallet = null
  }

  // PUBLIC METHODS

  public clear = () => {
    this.addresses.forEach((address) => {
      if (address.privateKey) {
        resetArray(address.privateKey)
        address.privateKey = null
      }
    })

    this.hdWallet = null
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

    this.clear()
    this._initFromMnemonic(mnemonic, '')

    return mnemonic
  }

  public initFromDecryptedMnemonic = async (decryptedMnemonic: Uint8Array, passphrase: string) => {
    this.clear()
    this._initFromMnemonic(decryptedMnemonic, passphrase)

    passphrase = ''
    resetArray(decryptedMnemonic)
  }

  public initFromEncryptedMnemonic = async (encryptedMnemonic: string, password: string, passphrase: string) => {
    const { version, decryptedMnemonic } = await decryptMnemonic(encryptedMnemonic, password)

    this.clear()
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

  public isInitialized = () => this.hdWallet !== null

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
    if (this.hdWallet) throw new Error('Keyring: Secret recovery phrase already provided')
    if (!mnemonic) throw new Error('Keyring: Secret recovery phrase not provided')

    const seed = metamaskBip39.mnemonicToSeedSync(mnemonic, bip39Words, passphrase)
    this.hdWallet = HDKey.fromMasterSeed(seed)

    passphrase = ''
  }

  private _deriveAddressAndKeys = (addressIndex: number): SensitiveAddressData => {
    if (!this.hdWallet)
      throw new Error('Keyring: Cannot derive address and keys, secret recovery phrase is not provided')
    if (!isAddressIndexValid(addressIndex)) throw new Error('Invalid address index path level')

    const keyType = 'default'
    const path = getHDWalletPath(keyType, addressIndex)
    const keyPair = this.hdWallet.derive(path)

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
