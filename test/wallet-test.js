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
    let myWallet = wallet.import('9167a5de4cfd4cd36a5ab065e21b2659f34cfd3503fde883b0fa5556d03cb64f');
    assert.deepStrictEqual('9b85fef33febd483e055b01af0671714b56c6f3b6f45612589c2d6ae5337fb6d', myWallet.publicKey);
    assert.deepStrictEqual('1Dx7Y4RxkCvoYvhQpMnRZi2yJnSbUeoVZY5R1vSYWSk9p', myWallet.address);
  })
});
