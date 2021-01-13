// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

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

  blockflowFetch(fromTs, toTs) {
    assert(typeof fromTs === 'number');
    assert(typeof toTs === 'number');

    return this.get(`/blockflow?fromTs=${fromTs}&toTs=${toTs}`);
  }


  getBalance(address) {
    assert(typeof address === 'string');

    return this.get(`/addresses/${address}/balance`);
  }

  getGroup(address) {
    assert(typeof address === 'string');

    return this.get(`/addresses/${address}/group`);
  }


  selfClique() {
      console.log('self clique.');
    return this.get('/infos/self-clique');
  }

  transactionCreate(fromKey, toAddress, value) {
    assert(typeof fromKey === 'string');
    assert(typeof toAddress === 'string');
    assert(typeof value === 'string');

    return this.get(`/transactions/build?fromKey=${fromKey}&toAddress=${toAddress}&value=${value}`);
  }

  transactionSend(tx, signature) {
    assert(typeof tx === 'string');
    assert(typeof signature === 'string');

    return this.post('/transactions/send', {
      'unsignedTx': tx,
      'signature': signature
    });
  }
}

module.exports = NodeClient;
