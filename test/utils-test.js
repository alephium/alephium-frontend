'use strict';

const assert = require('bsert');
const utils = require('../lib/utils');
const store = utils.Storage();

describe('utils', function() {
  it('should store and load locally', () => {
    const obj0 = { 'theAnswer': 42 };
    store.save('default', obj0);
    const obj1 = store.load('default');
    assert.deepStrictEqual(obj0, obj1);
    store.remove('default');
  });
  it('should store and list multiple wallets', () => {
    const obj0 = { 'theAnswer': 42 };
    store.save('one', obj0);
    store.save('two', obj0);
    assert.deepStrictEqual(['one', 'two'], store.list())
  })
});
