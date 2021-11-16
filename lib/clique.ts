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
import { ec as EC } from 'elliptic'

const ec = new EC('secp256k1')
import * as utils from '../lib/utils'

/**
 * Clique Client
 */

export class CliqueClient extends Api<null> {
  clique!: SelfClique
  clients!: NodeClient[]

  async init(isMultiNodesClique: boolean) {
    this.clients = []

    const res = await this.selfClique()

    if (res.error) {
      throw new Error(res.error.detail)
    }

    if (isMultiNodesClique) {
      this.clique = res.data

      if (this.clique.nodes) {
        for (const node of this.clique.nodes) {
          const client = new NodeClient({
            baseUrl: `http://${node.address}:${node.restPort}`
          })

          this.clients.push(client)
        }
      }
    } else {
      const client = new NodeClient({
        baseUrl: this.baseUrl
      })

      this.clients.push(client)
    }
  }

  async selfClique() {
    return await this.infos.getInfosSelfClique()
  }

  async getClientIndex(address: string) {
    const res = await this.addresses.getAddressesAddressGroup(address)

    if (res.error) {
      throw new Error(res.error.detail)
    }

    const group = res.data.group

    if (this.clients.length === 0) {
      // This shouldn't happen as current user is in the clique
      throw new Error('Unknown error (no nodes in the clique)')
    }

    return group % this.clients.length
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

  async transactionCreate(fromAddress: string, fromKey: string, toAddress: string, amount: string, lockTime?: number) {
    const clientIndex = await this.getClientIndex(fromAddress)
    return await this.clients[clientIndex].transactionCreate(fromKey, toAddress, amount, lockTime)
  }

  async transactionSend(fromAddress: string, tx: string, signature: string) {
    const clientIndex = await this.getClientIndex(fromAddress)
    return await this.clients[clientIndex].transactionSend(tx, signature)
  }

  transactionSign(txHash: string, privateKey: string) {
    const keyPair = ec.keyFromPrivate(privateKey)
    const signature = keyPair.sign(txHash)

    return utils.signatureEncode(ec, signature)
  }

  transactionVerifySignature(txHash: string, publicKey: string, signature: string) {
    try {
      const key = ec.keyFromPublic(publicKey, 'hex')
      return key.verify(txHash, utils.signatureDecode(ec, signature))
    } catch (error) {
      return false
    }
  }
}
