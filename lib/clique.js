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
const NodeClient = require('../lib/node');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const utils = require('../lib/utils');

/**
 * Clique Client
 */

class CliqueClient {
  /**
   * Creat a node client.
   */

  constructor(clique) {
    this.clique = clique;
    this.clients = [];

    for (const peer of clique.peers) {
      const client = new NodeClient({
        host: peer.address,
        port: peer.rpcPort
      });

      this.clients.push(client);
    }

    this.groups = clique.peers.length * clique.groupNumPerBroker;
  }

  async execute(method, params) {
    return this.clients[0].execute(method, params);
  }

  async getClientIndex(address) {
    const group = await this.getGroupIndex(address);
    return parseInt(group / this.clique.groupNumPerBroker);
  }

  async getGroupIndex(address) {
    return (await this.clients[0].getGroup(address)).result.group
  }

  async blockflowFetch(fromTs, toTs) {
    return this.clients[0].blockflowFetch(fromTs, toTs);
  }

  async getBalance(address) {
    const client = await this.getClientIndex(address);
    return this.clients[client].getBalance(address);
  }

  getWebSocket(peer_i) {
    const peer = this.clique.peers[peer_i];
    return new WebSocket('ws://' + peer.address + ':' + peer.wsPort + '/events');
  }

  async transactionCreate(fromAddress, fromKey, toAddress, value) {
    const client = await this.getClientIndex(fromAddress);
    return this.clients[client].transactionCreate(fromKey, toAddress, value);
  }

  async transactionSend(fromAddress, tx, signature) {
    const client = await this.getClientIndex(fromAddress);
    return this.clients[client].transactionSend(tx, signature);
  }

  transactionSign(txHash, privateKey) {
    assert(typeof txHash === 'string');
    assert(typeof privateKey === 'string');

    const keyPair = ec.keyFromPrivate(privateKey);
    const signature = keyPair.sign(txHash);

    return utils.signatureEncode(ec, signature);
  }
}

module.exports = CliqueClient;
