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
    assert.deepStrictEqual('12GVuxoYsXXmchvYdBtt3xTDwzppqN5SUovzPB7fzycZu', myWallet.address);
    assert.deepStrictEqual('406950245cf34a9beae04c30d0aaaf776b30301f2347d96d3843f363cd658559', myWallet.publicKey);
    assert.deepStrictEqual('139ea0dacc82a61f0173e9df8ec9dbdf0b76a254725f6b095a31975dd996f6432c827fc6c4ceded76c042e655d1dc2efc014fadb01d640689e80dc50a5a3f55f', myWallet.privateKey);
  })
});
