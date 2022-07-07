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

import rnPbkdf2 from 'react-native-fast-pbkdf2'

export const pbkdf2 = (password: string, salt: Buffer): Promise<Buffer> => {
  const _salt = salt.toString('base64')
  return rnPbkdf2.derive(password, _salt, 10000, 32, 'sha-256')
  .then((data: string) => Buffer.from(data, 'base64'))
}

// Directly from bip39 package
function salt(password: string) {
  return 'mnemonic' + (password || '');
}

// Derived from bip39 package
export const mnemonicToSeed = (mnemonic: string, passphrase?: string): Promise<Buffer> => {
  const salted = new Buffer(salt(passphrase ?? ''), 'utf8')
  return rnPbkdf2.derive(mnemonic, salted.toString('base64'), 2048, 64, 'sha-512')
  .then((data: string) => Buffer.from(data, 'base64'))
}
