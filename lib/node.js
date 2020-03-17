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

  mkRequest(method, params) {
    const req = {
      'id': 0,
      'jsonrpc': '2.0',
      'method': method,
      'params': params
    };

    return req;
  }

  getBalance(address) {
    assert(typeof address === 'string');

    const req = this.mkRequest('get_balance', {
      'address': address,
      'type': 'pkh'
    });

    return this.post('/', req);
  }

  getGroup(address) {
    assert(typeof address === 'string');

    const req = this.mkRequest('get_group', {
      'address': address
    });

    return this.post('/', req);
  }


  selfClique() {
    const req = this.mkRequest('self_clique', {});
    return this.post('/', req);
  }

  transfer(fromAddress, fromType, fromPrivateKey, toAddress, toType, value) {
    assert(typeof fromAddress === 'string');
    assert(typeof fromType === 'string');
    assert(typeof fromPrivateKey === 'string');
    assert(typeof toAddress === 'string');
    assert(typeof toType === 'string');
    assert(typeof value === 'string');

    const req = this.mkRequest('transfer', {
      'fromAddress': fromAddress,
      'fromType': fromType,
      'fromPrivateKey': fromPrivateKey,
      'toAddress': toAddress,
      'toType': toType,
      'value': value
    });

    return this.post('/', req);
  }

}

module.exports = NodeClient;
