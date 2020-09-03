'use strict';

const assert = require('bsert');
const fs = require('fs');

const ALF = require('../lib/alf-client');
const wallet = ALF.wallet;

describe('Wallet', function() {
  it('should encrypt and decrypt using password', async () => {
    let myPassword = 'utopia';
    let myWallet = wallet.generate();
    let readWallet = await wallet.open(myPassword, myWallet.encrypt(myPassword))
    assert.deepStrictEqual(myWallet, readWallet);
  });
  it('should import wallet in a compatible manner', () => {
    const genesis = JSON.parse(fs.readFileSync('test/genesis.json', 'utf8'));
    genesis.forEach(function(row) {
      let myWallet = wallet.import(row.mnemonic);
      assert.deepStrictEqual(row.address, myWallet.address);
      assert.deepStrictEqual(row.pubKey, myWallet.publicKey);
      assert.deepStrictEqual(row.priKey, myWallet.privateKey);
    });
  });
  it('should generate wallet from seed in a bip32 compatible manner', () => {
    let myWallet = wallet.fromSeed(Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex'));
    assert.deepStrictEqual('582faca65228efd4cbf229a274c4811dd9e20fc5a49dca98d093e781b9f16bff', myWallet.privateKey);
  });
  it('generate mnemonic with 24 words', () => {
    let myWallet = wallet.generate();
    assert.deepStrictEqual(myWallet.mnemonic.split(" ").length, 24);
  })
});
