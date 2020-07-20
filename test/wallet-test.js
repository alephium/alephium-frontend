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
    let myWallet = wallet.import('absent man bright miss adult input hole useless twist chair kiss motor');
    assert.deepStrictEqual('15MeQQNJuATC4GrH9u4HVJG5iSgkgxrarfVKzJ2ywtCM6', myWallet.address);
    assert.deepStrictEqual('5819c0aae89a07b9733c9c9776fb8448aed7986681582cf43cdd2c05f0ecd1c2', myWallet.publicKey);
    assert.deepStrictEqual('5912fe4753c447eb458c80918091ab35ddebaaaaebabefcd6c85ef3c23c13d42', myWallet.privateKey);
  });
  it('should generate wallet from seed in a bip32 compatible manner', () => {
    let myWallet = wallet.fromSeed(Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex'));
    assert.deepStrictEqual('e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35', myWallet.privateKey);
  })
});
