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
    assert.deepStrictEqual('12DrN5ufyGFaX2nhJrrUQUZFFwQPkxVRzgsfnU9BR82ux', myWallet.address);
    assert.deepStrictEqual('5f78d6c00ea6b4b6721f833893b549a63a020327d77202a19f058e5dcd627be6', myWallet.publicKey);
    assert.deepStrictEqual('c9e596165497cbe6b6fe6860c3bde14bfdba8d2600f85bb9e72ade3bdeb62a64', myWallet.privateKey);

  })
});
