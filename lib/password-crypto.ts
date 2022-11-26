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

import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync, CipherKey, BinaryLike } from 'crypto'

const saltByteLength = 64
const ivByteLength = 64
const authTagLength = 16

export type Pbkdf2Function = (password: string, salt: Buffer) => Promise<Buffer>

export const encrypt = (password: string, dataRaw: string): string => {
  const { data, salt } = formatDataAndGetRandomSalt(dataRaw)
  const derivedKey = keyFromPassword(password, salt)

  return encryptWithSalt(data, salt, derivedKey)
}

export const encryptAsync = async (
  password: string,
  dataRaw: string,
  pbkdf2CustomFunc: Pbkdf2Function
): Promise<string> => {
  const { data, salt } = formatDataAndGetRandomSalt(dataRaw)
  const derivedKey = await keyFromPasswordAsync(password, salt, pbkdf2CustomFunc)

  return encryptWithSalt(data, salt, derivedKey)
}

export const simpleEncrypt = (password: string, dataRaw: string): string => {
  const { data, salt } = formatDataAndGetEmptySalt(dataRaw)
  const derivedKey = keyFromPassword(password, salt, 'sha512')

  return encryptWithoutSalt(data, derivedKey)
}

export const simpleEncryptAsync = async (
  password: string,
  dataRaw: string,
  pbkdf2CustomFunc: Pbkdf2Function
): Promise<string> => {
  const { data, salt } = formatDataAndGetEmptySalt(dataRaw)
  const derivedKey = await pbkdf2CustomFunc(password, salt)

  return encryptWithoutSalt(data, derivedKey)
}

export const decrypt = (password: string, payloadRaw: string): string => {
  const { salt, iv, encrypted } = extractDataFromPayload(payloadRaw)
  const derivedKey = keyFromPassword(password, salt)

  return _decrypt(iv, encrypted, derivedKey)
}

export const decryptAsync = async (
  password: string,
  payloadRaw: string,
  pbkdf2CustomFunc: Pbkdf2Function
): Promise<string> => {
  const { salt, iv, encrypted } = extractDataFromPayload(payloadRaw)
  const derivedKey = await keyFromPasswordAsync(password, salt, pbkdf2CustomFunc)

  return _decrypt(iv, encrypted, derivedKey)
}

export const simpleDecrypt = (password: string, payloadRaw: string): string => {
  const { iv, salt, encrypted } = extractDataFromSimplePayload(payloadRaw)
  const derivedKey = keyFromPassword(password, salt)

  return _decrypt(iv, encrypted, derivedKey)
}

export const simpleDecryptAsync = async (
  password: string,
  payloadRaw: string,
  pbkdf2CustomFunc: Pbkdf2Function
): Promise<string> => {
  const { iv, salt, encrypted } = extractDataFromSimplePayload(payloadRaw)
  const derivedKey = await keyFromPasswordAsync(password, salt, pbkdf2CustomFunc)

  return _decrypt(iv, encrypted, derivedKey)
}

const encryptWithSalt = (data: Buffer, salt: Buffer, derivedKey: Buffer): string => {
  const { iv, encrypted } = getEncryptedData(data, derivedKey)

  return JSON.stringify({
    iv,
    encrypted,
    salt: salt.toString('hex'),
    version: 1
  })
}

const encryptWithoutSalt = (data: Buffer, derivedKey: Buffer) => {
  const { iv, encrypted } = getEncryptedData(data, derivedKey)

  return JSON.stringify({
    iv,
    e: encrypted,
    v: 2
  })
}

const getEncryptedData = (data: Buffer, derivedKey: Buffer) => {
  const iv = randomBytes(ivByteLength)
  const cipher = createCipher(derivedKey, iv)
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
  const authTag = cipher.getAuthTag()

  return {
    iv: iv.toString('hex'),
    encrypted: Buffer.concat([encrypted, authTag]).toString('hex')
  }
}

const formatDataAndGetRandomSalt = (dataRaw: string) => ({
  data: Buffer.from(dataRaw, 'utf8'),
  salt: randomBytes(saltByteLength)
})

const formatDataAndGetEmptySalt = (dataRaw: string) => ({
  data: Buffer.from(dataRaw, 'utf8'),
  salt: Buffer.from('', 'utf8')
})

const extractDataFromPayload = (payloadRaw: string) => {
  const payload = JSON.parse(payloadRaw)

  const version = payload.version
  if (version !== 1) {
    throw new Error(`Invalid version: got ${version}, expected: 1`)
  }

  return {
    salt: Buffer.from(payload.salt, 'hex'),
    iv: Buffer.from(payload.iv, 'hex'),
    encrypted: Buffer.from(payload.encrypted, 'hex')
  }
}

const extractDataFromSimplePayload = (payloadRaw: string) => {
  const payload = JSON.parse(payloadRaw)

  const version = payload.v
  if (version !== 2) {
    throw new Error(`Invalid version: got ${version}, expected: 2`)
  }

  return {
    salt: Buffer.from('', 'hex'),
    iv: Buffer.from(payload.iv, 'hex'),
    encrypted: Buffer.from(payload.e, 'hex')
  }
}

const _decrypt = (iv: Buffer, encrypted: Buffer, derivedKey: Buffer): string => {
  const decipher = createDecipher(derivedKey, iv)
  const data = encrypted.slice(0, encrypted.length - authTagLength)
  const authTag = encrypted.slice(encrypted.length - authTagLength, encrypted.length)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()])

  return decrypted.toString('utf8')
}

const createCipher = (key: CipherKey, iv: BinaryLike | null) => {
  return createCipheriv('aes-256-gcm', key, iv)
}

const createDecipher = (key: CipherKey, iv: BinaryLike | null) => {
  return createDecipheriv('aes-256-gcm', key, iv)
}

const keyFromPassword = (password: BinaryLike, salt: BinaryLike, digest: 'sha256' | 'sha512' = 'sha256'): Buffer => {
  return pbkdf2Sync(password, salt, 10000, 32, digest)
}

const keyFromPasswordAsync = (password: string, salt: Buffer, pbkdf2CustomFunc: Pbkdf2Function): Promise<Buffer> => {
  return pbkdf2CustomFunc(password, salt)
}
