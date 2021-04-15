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

/**
 * Node Client
 * @extends {bcurl.Client}
 */

class NodeClient {
  /**
   * Creat a node client.
   * @param {Object?} options
   */

  host: string
  port: string

  constructor(host: string, port: string) {
    this.host = host
    this.port = port
  }

  get(address: string, options?: RequestInit | undefined): Promise<Response> {
    return fetch(`${this.host}:${this.port}${address}`, options)
  }

  blockflowFetch(fromTs: number, toTs: number) {
    return this.get(`/blockflow?fromTs=${fromTs}&toTs=${toTs}`)
  }

  getBalance(address: string) {
    return this.get(`/addresses/${address}/balance`)
  }

  getGroup(address: string) {
    return this.get(`/addresses/${address}/group`)
  }

  selfClique() {
    console.log('self clique.')
    return this.get('/infos/self-clique')
  }

  transactionCreate(fromKey: string, toAddress: string, value: string, lockTime: string) {
    const root = `/transactions/build?fromKey=${fromKey}&toAddress=${toAddress}&value=${value}`

    if (lockTime == null) {
      return this.get(root)
    } else {
      return this.get(root + `&lockTime=${lockTime}`)
    }
  }

  transactionSend(tx: string, signature: string) {
    return this.get('/transactions/send', {
      method: 'POST',
      body: JSON.stringify({
        unsignedTx: tx,
        signature: signature
      })
    })
  }
}

export default NodeClient
