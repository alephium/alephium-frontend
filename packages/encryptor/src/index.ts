import { decrypt as metamaskDecrypt, encrypt, EncryptionResult } from '@metamask/browser-passworder'
import { Buffer } from 'buffer'

// Polyfill Buffer if we are in a browser environment
if (typeof window !== 'undefined') window.Buffer = Buffer

export { encrypt, EncryptionResult }

// We used to encrypt data using Node.js modules in @alephium/shared-crypto by copying Metamask's approach (see
// https://github.com/alephium/js-sdk/pull/133#issuecomment-1328787203).
// To make the switch to @metamask/browser-passworder we need to convert the encrypted data before decrypting them with
// @metamask/browser-passworder. Specifically, we need to convert hex strings to base64 and to specify the iterations to
// be 10_000.
export const decrypt = (password: string, text: string) => {
  const encryptedData = JSON.parse(text) as DeprecatedEncryptionResult | EncryptionResult

  if (isDeprecatedEncryptionResult(encryptedData)) {
    return metamaskDecrypt(password, JSON.stringify(convertDeprecatedEncryptionResult(encryptedData)))
  } else if (encryptedData.data) {
    return metamaskDecrypt(password, text)
  } else {
    throw new Error('Encryptor: Could not decrypt data, unknown encrypted data format')
  }
}

type DeprecatedEncryptionResult = {
  iv: string // hex
  encrypted: string // hex
  salt: string // hex
  version: 1
}

const isDeprecatedEncryptionResult = (
  encryptionResult: DeprecatedEncryptionResult | EncryptionResult
): encryptionResult is DeprecatedEncryptionResult => {
  const result = encryptionResult as DeprecatedEncryptionResult

  return result.version === 1 && !!result.encrypted
}

const convertDeprecatedEncryptionResult = (deprecatedEncryptionResult: DeprecatedEncryptionResult) => ({
  data: hexToBase64(deprecatedEncryptionResult.encrypted),
  salt: hexToBase64(deprecatedEncryptionResult.salt),
  iv: hexToBase64(deprecatedEncryptionResult.iv),
  keyMetadata: {
    algorithm: 'PBKDF2',
    params: {
      iterations: 10_000
    }
  }
})

const hexToBase64 = (hexString: string) => Buffer.from(hexString, 'hex').toString('base64')
