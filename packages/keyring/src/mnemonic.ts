import * as encryptor from '@alephium/encryptor'
import { bip39Words, resetArray } from '@alephium/shared'
import * as metamaskBip39 from '@metamask/scure-bip39'

export type MnemonicLength = 12 | 24

export type EncryptedMnemonicVersion = 1 | 2

export type DecryptMnemonicResult = {
  decryptedMnemonic: Uint8Array
  version: EncryptedMnemonicVersion
}

export type DeprecatedEncryptedMnemonicStoredAsString = {
  version: 1
  mnemonic: string
}

export class EncryptedMnemonicStoredAsUint8Array {
  readonly version: EncryptedMnemonicVersion = 2
  readonly mnemonic: Uint8Array

  constructor(mnemonic: Uint8Array) {
    this.mnemonic = mnemonic
  }
}

// It will convert the mnemonic from Uint8Array to string, leaking it to the memory. Use only when absolutely needed,
// ie: displaying the mnemonic for backup, etc
export const dangerouslyConvertUint8ArrayMnemonicToString = (mnemonic: Uint8Array) =>
  Array.from(new Uint16Array(new Uint8Array(mnemonic).buffer))
    .map((i) => bip39Words[i])
    .join(' ')

export const encryptMnemonic = async (mnemonic: Uint8Array, password: string) => {
  if (!metamaskBip39.validateMnemonic(mnemonic, bip39Words))
    throw new Error('Keyring: Cannot encrypt mnemonic, invalid mnemonic provided')

  const result = await encryptor.encrypt(password, new EncryptedMnemonicStoredAsUint8Array(mnemonic))

  password = ''
  resetArray(mnemonic)

  return result
}

export const decryptMnemonic = async (encryptedMnemonic: string, password: string): Promise<DecryptMnemonicResult> => {
  const { version: _v, mnemonic } = (await encryptor.decrypt(password, encryptedMnemonic)) as
    | EncryptedMnemonicStoredAsUint8Array
    | DeprecatedEncryptedMnemonicStoredAsString

  // When we started versioning the mnemonic with 1 we didn't create a migration script (see
  // https://github.com/alephium/js-sdk/commit/514bd8b920958dbfac68257bd3ce1c53f6bdde27). This resulted in unversioned
  // mnemonic data. To fix this, we assume that undefined versioning is the same as version 1.
  const version = _v ?? 1

  if (version === 1) {
    console.warn(
      '☣️ Mnemonic is leaked to memory as a string while decrypting, needs to be stored as an Uint8Array (EncryptedMnemonicStoredAsUint8Array).'
    )
  }

  if (
    !version ||
    (version !== 1 && version !== 2) ||
    (version === 1 && typeof mnemonic !== 'string') ||
    (version === 2 && !(mnemonic instanceof Object))
  )
    throw new Error('Keyring: Cannot decrypt mnemonic, the provided mnemonic is invalid')

  password = ''
  encryptedMnemonic = ''

  return {
    version,
    decryptedMnemonic:
      version === 1 && typeof mnemonic === 'string'
        ? mnemonicStringToUint8Array(mnemonic)
        : mnemonicJsonStringifiedObjectToUint8Array(mnemonic)
  }
}

export const mnemonicStringToUint8Array = (mnemonicStr: string): Uint8Array => {
  const indices = mnemonicStr.split(' ').map((word) => bip39Words.indexOf(word))

  return new Uint8Array(new Uint16Array(indices).buffer)
}

// When JSON.stringify an Uint8Array it becomes a JS object that we need to cast back to an Uint8Array
export const mnemonicJsonStringifiedObjectToUint8Array = (mnemonic: unknown): Uint8Array => {
  if (!(mnemonic instanceof Object))
    throw new Error('Keyring: Could not convert stringified Uint8Array mnemonic back to Uint8Array')

  return Uint8Array.from(Object.values(mnemonic))
}
