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

import { NodeClient } from '../lib/node'
import { Api, SelfClique } from '../api/api-alephium'
import { getData } from '.'
const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const utils = require('../lib/utils')

/**
 * Clique Client
 */

export class CliqueClient extends Api<null> {
  clique!: SelfClique
  clients!: NodeClient[]

  async init() {
    this.clients = []
    this.clique = await this.selfClique()

    if (this.clique.nodes) {
      for (const node of this.clique.nodes) {
        const client = new NodeClient({
          baseUrl: `http://${node.address}:${node.restPort}`
        })

        this.clients.push(client)
      }
    }
  }

  async selfClique() {
    return await getData(this.infos.getInfosSelfClique())
  }

  async getClientIndex(address: string) {
    const { group } = await getData(this.addresses.getAddressesAddressGroup(address))
    return Math.floor(group / this.clique.groupNumPerBroker)
  }

  async blockflowFetch(fromTs: number, toTs: number) {
    return this.clients[0].blockflowFetch(fromTs, toTs)
  }

  async getBalance(address: string) {
    const clientIndex = await this.getClientIndex(address)
    return await this.clients[clientIndex].getBalance(address)
  }

  getWebSocket(node_i: number) {
    if (this.clique.nodes) {
      const node = this.clique.nodes[node_i]
      return new WebSocket('ws://' + node.address + ':' + node.wsPort + '/events')
    }
  }

  async transactionCreate(fromAddress: string, fromKey: string, toAddress: string, value: number, lockTime: string) {
    const client = await this.getClientIndex(fromAddress)
    return this.clients[client].transactionCreate(fromKey, toAddress, value, lockTime)
  }

  async transactionSend(fromAddress: string, tx: string, signature: string) {
    const client = await this.getClientIndex(fromAddress)
    return this.clients[client].transactionSend(tx, signature)
  }

  transactionSign(txHash: string, privateKey: string) {
    const keyPair = ec.keyFromPrivate(privateKey)
    const signature = keyPair.sign(txHash)

    return utils.signatureEncode(ec, signature)
  }
}
