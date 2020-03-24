'use strict';

const assert = require('bsert');
const {Client} = require('bcurl');

/**
 * Node Client
 * @extends {bcurl.Client}
 */

class NodeClient extends Client {
  /**
   * Creat a node client.
   * @param {Object?} options
   */

  constructor(options) {
    super(options);
  }

  execute(method, params) {
    const req = {
      'id': 0,
      'jsonrpc': '2.0',
      'method': method,
      'params': params
    };
    return this.post('/', req);
  }

  blockflowFetch(fromTs, toTs) {
    assert(typeof fromTs === 'number');
    assert(typeof toTs === 'number');

    return this.execute('blockflow_fetch', {
      'fromTs': fromTs,
      'toTs': toTs
    });
  }


  getBalance(address) {
    assert(typeof address === 'string');

    return this.execute('get_balance', {
      'address': address,
      'type': 'pkh'
    });
  }

  getGroup(address) {
    assert(typeof address === 'string');

    return this.execute('get_group', {
      'address': address
    });
  }


  selfClique() {
    return this.execute('self_clique', {});
  }

  transfer(fromAddress, fromType, fromPrivateKey, toAddress, toType, value) {
    assert(typeof fromAddress === 'string');
    assert(typeof fromType === 'string');
    assert(typeof fromPrivateKey === 'string');
    assert(typeof toAddress === 'string');
    assert(typeof toType === 'string');
    assert(typeof value === 'string');

    return this.execute('transfer', {
      'fromAddress': fromAddress,
      'fromType': fromType,
      'fromPrivateKey': fromPrivateKey,
      'toAddress': toAddress,
      'toType': toType,
      'value': value
    });
  }

}

module.exports = NodeClient;
