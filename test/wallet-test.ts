// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import fs from 'fs'

import * as walletUtils from '../dist/lib/wallet.js'

describe('Wallet', function () {
  it('should encrypt and decrypt using password', async () => {
    const myPassword = 'utopia'
    const myWallet = walletUtils.walletGenerate()
    const readWallet = await walletUtils.walletOpen(myPassword, myWallet.encrypt(myPassword))
    expect(JSON.stringify(myWallet)).toEqual(JSON.stringify(readWallet))
  })

  it('should import wallet in a compatible manner', () => {
    const genesis = JSON.parse(fs.readFileSync('test/genesis.json', 'utf8'))
    genesis.forEach(function (row: { mnemonic: string; address: string; pubKey: string; priKey: string }) {
      const myWallet = walletUtils.walletImport(row.mnemonic)
      expect(row.address).toEqual(myWallet.address)
      expect(row.pubKey).toEqual(myWallet.publicKey)
      expect(row.priKey).toEqual(myWallet.privateKey)
    })
  })

  it('should generate wallet from seed in a bip32 compatible manner', () => {
    const myWallet = walletUtils.getWalletFromSeed(Buffer.from('231613f21f4c749167d6d9e625c983b6c606134dbd7d99d55dea874e1d734eae1d45d7700bac615d6e9b764ac0985c4e1d69a822108bdcf015425f75f7cd1c2f', 'hex'))
    expect('499fd1295acad7870e61f96aa1d28f4c0264439c7bc66840c7895c14fa71cfc5').toEqual(myWallet.privateKey)
  })

  it('generate mnemonic with 24 words', () => {
    const myWallet = walletUtils.walletGenerate()
    expect(myWallet.mnemonic.split(' ').length).toEqual(24)
  })

  it('should read wallet file', async () => {
    const wallets = JSON.parse(fs.readFileSync('test/wallets.json', 'utf8')).wallets
    for (const row of wallets) {
      const imported = walletUtils.walletImport(row.mnemonic)
      const opened = await walletUtils.walletOpen(row.password, JSON.stringify(row.file))

      expect(imported.address).toEqual(opened.address)
      expect(imported.publicKey).toEqual(opened.publicKey)
      expect(imported.privateKey).toEqual(opened.privateKey)
      expect(imported.seed).toEqual(opened.seed)

      // Old wallets don't include mnemonic
      if (opened.mnemonic) {
        expect(imported.mnemonic).toEqual(opened.mnemonic)
      }
    }
  })
})
