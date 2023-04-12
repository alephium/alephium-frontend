/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { ec as EC } from 'elliptic'

import { NodeClient } from './node'
import * as utils from './utils'
import { node } from '@alephium/web3'

const ec = new EC('secp256k1')

/**
 * Clique Client
 */

export class CliqueClient extends node.Api<null> {
  clique!: node.SelfClique
  clients!: NodeClient[]

  async init(isMultiNodesClique: boolean) {
    this.clients = []

    const res = await this.selfClique()

    if (isMultiNodesClique) {
      this.clique = res

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

  static convert<T>(response: node.HttpResponse<T, { detail: string }>): T {
    if (response.error) {
      console.log(response.error.detail)
      throw new Error(response.error.detail)
    } else {
      return response.data
    }
  }

  async selfClique() {
    return await this.infos.getInfosSelfClique()
  }

  getClientIndex(address: string) {
    if (this.clients.length === 0) throw new Error('No nodes in the clique')
    const group = utils.groupOfAddress(address)

    return group % this.clients.length
  }

  async getBalance(address: string) {
    const clientIndex = this.getClientIndex(address)

    return await this.clients[clientIndex].getBalance(address)
  }

  getWebSocket(node_i: number) {
    if (this.clique.nodes) {
      const node = this.clique.nodes[node_i]

      return new WebSocket('ws://' + node.address + ':' + node.wsPort + '/events')
    }
  }

  async transactionCreate(
    fromAddress: string,
    fromPublicKey: string,
    toAddress: string,
    amount: string,
    lockTime?: number,
    gas?: number,
    gasPrice?: string
  ) {
    const clientIndex = this.getClientIndex(fromAddress)

    return await this.clients[clientIndex].transactionCreate(fromPublicKey, toAddress, amount, lockTime, gas, gasPrice)
  }

  async transactionConsolidateUTXOs(fromPublicKey: string, fromAddress: string, toAddress: string) {
    const clientIndex = this.getClientIndex(fromAddress)

    return await this.clients[clientIndex].transactionConsolidateUTXOs(fromPublicKey, toAddress)
  }

  async transactionSend(fromAddress: string, tx: string, signature: string) {
    const clientIndex = this.getClientIndex(fromAddress)

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
