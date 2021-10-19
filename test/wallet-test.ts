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
    const myPassword = 'alephium'
     const myWallet = walletUtils.walletGenerate()
    const readWallet = await walletUtils.walletOpen(myPassword, myWallet.encrypt(myPassword))
    expect(JSON.stringify(myWallet)).toEqual(JSON.stringify(readWallet))

    const wrongPassword = 'utopia'
    await expect(() => {
      walletUtils.walletOpen(wrongPassword, myWallet.encrypt(myPassword))
    }).toThrow('Unsupported state or unable to authenticate data')
  })

  it('should import wallet in a compatible manner', () => {
    const genesis = JSON.parse(fs.readFileSync('test/genesis.json', 'utf8'))
    const randomAddress = '143jS8xaGNNRes4f1mxJWSpQcqj2xjsXUeu3xQqYgFm5h'
    const randomPubKey = '034817bc790123a551aa82453cc2ca1dd5ea7a9ffb85443a1a67936c3299d7a751'
    const randomPriKey = '695ac21c784d0d3f9f5441de0ee07f724d12be258f0ebdaef7ff5ee540f8e2d8'
    genesis.forEach(function (row: { mnemonic: string; address: string; pubKey: string; priKey: string }) {
      const myWallet = walletUtils.walletImport(row.mnemonic)
      expect(row.address).toEqual(myWallet.address)
      expect(row.address).not.toEqual(randomAddress)
      expect(row.pubKey).toEqual(myWallet.publicKey)
      expect(row.pubKey).not.toEqual(randomPubKey)
      expect(row.priKey).toEqual(myWallet.privateKey)
      expect(row.priKey).not.toEqual(randomPriKey)
    })
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
      expect(imported.mnemonic).toEqual(opened.mnemonic)
    }
  })
})
