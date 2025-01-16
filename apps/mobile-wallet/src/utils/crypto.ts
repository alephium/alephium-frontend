import { NativeModules } from 'react-native'

const Aes = NativeModules.Aes

export const pbkdf2 = async (password: string, salt: Buffer): Promise<Buffer> => {
  const _salt = salt.toString('base64')
  const data = await Aes.pbkdf2(password, _salt, 10000, 256)

  return Buffer.from(data, 'hex')
}
