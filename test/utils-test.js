'use strict';

const assert = require('bsert');
const utils = require('../lib/utils');
const store = utils.Storage();

describe('utils', function() {
  it('should store and load locally', () => {
    const obj0 = { 'theAnswer': 42 };
    store.save(obj0);
    const obj1 = store.load();
    assert.deepStrictEqual(obj0, obj1);
  });
});
