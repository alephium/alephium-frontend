import Crypto from 'react-native-quick-crypto'

const KEYLEN = 32
const ITER = 10000
const DIGEST = 'sha512'
const AUTH_TAG_LENGTH = 16

// Decrypts data encrypted with the legacy AES-256-GCM + PBKDF2 (sha512) format that used to be provided by
// @alephium/shared-crypto. This format is still produced by the desktop wallet's QR export and by deprecated (v1)
// mobile wallets, so it must remain decryptable. The digest is not stored in the payload, hence it is hardcoded to
// sha512 to match the way the data was encrypted.
export const decrypt = (password: string, payloadRaw: string): string => {
  const { version, salt, iv, encrypted } = JSON.parse(payloadRaw)

  if (version !== 1) throw new Error(`Invalid version: got ${version}, expected: 1`)

  const encryptedBuffer = Crypto.Buffer.from(encrypted, 'hex')
  const derivedKey = Crypto.Buffer.from(
    Crypto.pbkdf2Sync(Crypto.Buffer.from(password, 'utf8'), Crypto.Buffer.from(salt, 'hex'), ITER, KEYLEN, DIGEST)
  )

  const decipher = Crypto.createDecipheriv('aes-256-gcm', derivedKey, Crypto.Buffer.from(iv, 'hex'))
  const data = encryptedBuffer.subarray(0, encryptedBuffer.length - AUTH_TAG_LENGTH)
  const authTag = encryptedBuffer.subarray(encryptedBuffer.length - AUTH_TAG_LENGTH)
  decipher.setAuthTag(authTag)

  return Crypto.Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}
