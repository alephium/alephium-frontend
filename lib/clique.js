'use strict';

const assert = require('bsert');
const NodeClient = require('../lib/node');
  
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

  async transfer(fromAddress, fromType, fromPrivateKey, toAddress, toType, value) {
    const client = await this.getClientIndex(fromAddress);
    return this.clients[client].transfer(fromAddress, fromType, fromPrivateKey, toAddress, toType, value);
  }
}

module.exports = CliqueClient;
