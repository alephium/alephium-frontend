'use strict';

const assert = require('bsert');
const ALF = require('../lib/alf-client');
const wallet = ALF.wallet;

describe('Wallet', function() {
  it('should encrypt and decrypt using password', () => {
    let myPassword = 'utopia';
    let myWallet = wallet.generate();
    let readWallet = wallet.open(myPassword, myWallet.encrypt(myPassword))
    assert.deepStrictEqual(myWallet, readWallet);
  });
  it('should import wallet in a compatible manner', () => {
    let myWallet = wallet.import('captain author fragile cart whisper process ketchup wink black traffic near industry north tiny arrange extra bone segment yard rate globe normal flower wolf');
    assert.deepStrictEqual('19KovAqpwwo5otUcx3ZRpDtLcXXEPRTrKxr1DpbqLBA49', myWallet.address);
    assert.deepStrictEqual('03a6c7186bdde625959c70e8018a42a3c9139ce11ccfde7cbb6a038f56f1d03507', myWallet.publicKey);
    assert.deepStrictEqual('ee0eb3a41ddfdbef696abd284e277d908bd7f643a452a399933f40cea052ac0f', myWallet.privateKey);
  });
  it('should generate wallet from seed in a bip32 compatible manner', () => {
    let myWallet = wallet.fromSeed(Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex'));
    assert.deepStrictEqual('582faca65228efd4cbf229a274c4811dd9e20fc5a49dca98d093e781b9f16bff', myWallet.privateKey);
  })
});
