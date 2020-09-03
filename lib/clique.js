'use strict';

const assert = require('bsert');
const NodeClient = require('../lib/node');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
  
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

    let keyPair = ec.keyFromPrivate(privateKey);
    let signature = keyPair.sign(txHash);

    // normalize
    var s_normalized = signature.s;
    if (signature.s.cmp(ec.nh) === 1) {
      s_normalized = ec.n.sub(signature.s).toArrayLike(Uint8Array, 'be', 32)
    }

    const signature_bytes = signature.r.toArray().concat(s_normalized.toArray());
    return Buffer.from(signature_bytes).toString('hex');
  }
}

module.exports = CliqueClient;
