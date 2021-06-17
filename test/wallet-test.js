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

'use strict';

import assert from 'bsert'
import fs from 'fs';

import * as wallet from '../dist/lib/wallet.js'
const networkType = "T";

describe('Wallet', function() {
  it('should encrypt and decrypt using password', async () => {
    let myPassword = 'utopia';
    let myWallet = wallet.walletGenerate(networkType).wallet;
    let readWallet = await wallet.walletOpen(myPassword, myWallet.encrypt(myPassword), networkType)
    assert.deepStrictEqual(myWallet, readWallet);
  });

  it('should import wallet in a compatible manner', () => {
    const genesis = JSON.parse(fs.readFileSync('test/genesis.json', 'utf8'));
    genesis.forEach(function(row) {
      let myWallet = wallet.walletImport(row.mnemonic, networkType);
      assert.deepStrictEqual(row.address, myWallet.address);
      assert.deepStrictEqual(row.pubKey, myWallet.publicKey);
      assert.deepStrictEqual(row.priKey, myWallet.privateKey);
    });
  });

  it('should generate wallet from seed in a bip32 compatible manner', () => {
    let myWallet = wallet.fromSeed(Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex'), networkType);
    assert.deepStrictEqual('ca9e41e365d987fb5fb29fc016ae14e90a5279ec8b890e0c25b13f748bd384cb', myWallet.privateKey);
  });

  it('generate mnemonic with 24 words', () => {
    let myWallet = wallet.walletGenerate(networkType);
    assert.deepStrictEqual(myWallet.mnemonic.split(" ").length, 24);
  });

  it('should read wallet file', async () => {
    const wallets = JSON.parse(fs.readFileSync('test/wallets.json', 'utf8')).wallets;
    for (const row of wallets) {
      let imported = wallet.walletImport(row.mnemonic, networkType);
      let opened = await wallet.walletOpen(row.password, JSON.stringify(row.file), networkType);
      assert.deepStrictEqual(imported, opened)
    }
  });
});
