import Crypto from 'react-native-quick-crypto'

const KEYLEN = 32
const ITER = 10000
const DIGEST = 'sha512'

export const pbkdf2 = (password: Buffer, salt: Buffer) => {
  const key = Crypto.pbkdf2Sync(password, salt, ITER, KEYLEN, DIGEST)

  return Buffer.from(key)
}
