'use strict';

const assert = require('bsert');
const fs = require('fs');

const ALF = require('../lib/alf-client');
const wallet = ALF.wallet;
const networkType = "T";

describe('Wallet', function() {
  it('should encrypt and decrypt using password', async () => {
    let myPassword = 'utopia';
    let myWallet = wallet.generate(networkType).wallet;
    let readWallet = await wallet.open(myPassword, myWallet.encrypt(myPassword), networkType)
    assert.deepStrictEqual(myWallet, readWallet);
  });

  it('should import wallet in a compatible manner', () => {
    const genesis = JSON.parse(fs.readFileSync('test/genesis.json', 'utf8'));
    genesis.forEach(function(row) {
      let myWallet = wallet.import(row.mnemonic, networkType);
      assert.deepStrictEqual(row.address, myWallet.address);
      assert.deepStrictEqual(row.pubKey, myWallet.publicKey);
      assert.deepStrictEqual(row.priKey, myWallet.privateKey);
    });
  });

  it('should generate wallet from seed in a bip32 compatible manner', () => {
    let myWallet = wallet.fromSeed(Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex'), networkType);
    assert.deepStrictEqual('582faca65228efd4cbf229a274c4811dd9e20fc5a49dca98d093e781b9f16bff', myWallet.privateKey);
  });

  it('generate mnemonic with 24 words', () => {
    let myWallet = wallet.generate(networkType);
    assert.deepStrictEqual(myWallet.mnemonic.split(" ").length, 24);
  });

  it('should read wallet file', async () => {
    const wallets = JSON.parse(fs.readFileSync('test/wallets.json', 'utf8')).wallets;
    for (const row of wallets) {
      let imported = wallet.import(row.mnemonic, networkType);
      let opened = await wallet.open(row.password, JSON.stringify(row.file), networkType);
      assert.deepStrictEqual(imported, opened)
    }
  });
});
