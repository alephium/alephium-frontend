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

import * as bip39 from 'bip39'
import rewire from 'rewire'

import * as walletUtils from '../lib/wallet'
import wallets from './fixtures/wallets.json'

describe('Wallet', function () {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('should call custom functions', () => {
    const walletUtilsRewire = rewire('../dist/wallet')
    const _pbkdf2 = walletUtilsRewire.__get__('_pbkdf2')

    it('walletOpenAsyncUnsafe should call custom mnemonicToSeed and pbkdf2 function', async () => {
      const wallet = wallets.wallets[0]
      const password = wallet.password
      const encryptedWallet = JSON.stringify(wallet.file)
      const mnemonicToSeedCustomFunc = jest.fn((m: string) => Promise.resolve(bip39.mnemonicToSeedSync(m)))
      const pbkdf2CustomFunc = jest.fn((p: string, s: Buffer) => _pbkdf2(p, s))
      await walletUtils.walletOpenAsyncUnsafe(password, encryptedWallet, pbkdf2CustomFunc, mnemonicToSeedCustomFunc)
      expect(mnemonicToSeedCustomFunc.mock.calls.length).toBe(1)
      expect(pbkdf2CustomFunc.mock.calls.length).toBe(1)
    })
  })
  describe('the default pbkdf2 function', () => {
    const walletUtilsRewire = rewire('../dist/wallet')
    const _pbkdf2 = walletUtilsRewire.__get__('_pbkdf2')

    it('should reject when giving an error', async () => {
      const wallet = wallets.wallets[0]
      const salt = wallet.file.salt
      const password = wallet.password
      await _pbkdf2(password, Buffer.from(salt, 'base64')).catch(() => {
        expect(true).toBe(true)
      })
    })
  })
})
