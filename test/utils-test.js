'use strict';

const assert = require('bsert');
const keccak = require('../lib/keccakjs');
const utils = require('../lib/utils');
const store = utils.Storage();

describe('utils', function() {
  it('should store and load locally', () => {
    const obj0 = { 'theAnswer': 42 };
    store.save('default', obj0);
    const obj1 = store.load('default');
    assert.deepStrictEqual(obj0, obj1);
  });
  it('should hash in a compatible manner', () => {
    const pubKey = '6d084b24287fa0ad939c689fbcf76ec9b750520cc2c2637a9055bac83e6277a2';
    const pubKeyHash = 'e2061a78acbbd857a3aab35b161cf948f7c60fd552e1d5634437b1e9eaab7a7b';
    var hash = new keccak(256);
    hash.update(Buffer.from(pubKey, 'hex'))
    const result = hash.digest('hex');
    assert.deepStrictEqual(pubKeyHash, result);
  })
});
