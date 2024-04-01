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

import { decrypt, encrypt } from '@alephium/shared-crypto'
import { wordlist } from '@metamask/scure-bip39/dist/wordlists/english'

export type MnemonicLength = 12 | 24

export type EncryptedMnemonicVersion = 1 | 2

export type DecryptMnemonicResult = {
  decryptedMnemonic: Uint8Array
  version: EncryptedMnemonicVersion
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
export const dangerouslyConvertUint8ArrayMnemonicToString = (mnemonic: Uint8Array) => {
  const recoveredIndices = Array.from(new Uint16Array(new Uint8Array(mnemonic).buffer))

  return recoveredIndices.map((i) => wordlist[i]).join(' ')
}

export const encryptMnemonic = (mnemonic: Uint8Array | null, password: string) => {
  if (!mnemonic) throw new Error('Keyring: Cannot encrypt mnemonic, mnemonic not provided')

  const result = encrypt(password, JSON.stringify(new EncryptedMnemonicStoredAsUint8Array(mnemonic)))

  password = ''
  mnemonic = null

  return result
}

export const decryptMnemonic = (encryptedMnemonic: string, password: string): DecryptMnemonicResult => {
  const dataDecrypted = decrypt(password, encryptedMnemonic)

  const { version, mnemonic } = JSON.parse(dataDecrypted) // StoredStateV1 or StoredStateV2

  if (version === 1) {
    console.warn(
      '☣️ Mnemonic is leaked to memory as a string while decrypting, needs to be stored as an Uint8Array (StoredStateV2).'
    )
  }

  if (
    !version ||
    (version !== 1 && version !== 2) ||
    (version === 1 && typeof mnemonic !== 'string') ||
    (version === 2 && !(mnemonic instanceof Object))
  )
    throw new Error('Encryptor: Cannot decrypt mnemonic, the provided mnemonic is invalid')

  password = ''
  encryptedMnemonic = ''

  return {
    version,
    decryptedMnemonic:
      version === 1 ? mnemonicStringToUint8Array(mnemonic) : mnemonicJsonStringifiedObjectToUint8Array(mnemonic)
  }
}

export const mnemonicStringToUint8Array = (mnemonicStr: string): Uint8Array => {
  const indices = mnemonicStr.split(' ').map((word) => wordlist.indexOf(word))

  return new Uint8Array(new Uint16Array(indices).buffer)
}

// When JSON.stringify an Uint8Array it becomes a JS object that we need to cast back to an Uint8Array
const mnemonicJsonStringifiedObjectToUint8Array = (mnemonic: unknown): Uint8Array => {
  if (!(mnemonic instanceof Object))
    throw new Error('Could not convert stringified Uint8Array mnemonic back to Uint8Array')

  return Uint8Array.from(Object.values(mnemonic))
}
