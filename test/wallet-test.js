'use strict';

const assert = require('bsert');
const wallet = require('../lib/wallet');

describe('Wallet', function() {
  it('should encrypt and decrypt using password', () => {
    let myPassword = 'utopia';
    let myWallet = wallet.generate();
    let readWallet = wallet.open(myPassword, myWallet.encrypt(myPassword))
    assert.deepStrictEqual(myWallet, readWallet);
  });
});
