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

import { Api } from '../api/Api'
import { getData } from './utils'

/**
 * Node client
 */

export class NodeClient extends Api<null> {
  blockflowFetch(fromTs: number, toTs: number) {
    //return this.get(`/blockflow?fromTs=${fromTs}&toTs=${toTs}`)
  }

  async getBalance(address: string) {
    return await getData(this.addresses.getAddressesAddressBalance(address))
  }

  getGroup(address: string) {
    //return this.get(`/addresses/${address}/group`)
  }

  selfClique() {
    //return this.get('/infos/self-clique')
  }

  transactionCreate(fromKey: string, toAddress: string, value: number, lockTime: string) {
    const root = `/transactions/build?fromKey=${fromKey}&toAddress=${toAddress}&value=${value}`

    if (lockTime == null) {
      //return this.get(root)
    } else {
      //return this.get(root + `&lockTime=${lockTime}`)
    }
  }

  transactionSend(tx: string, signature: string) {
    /*
    return this.get('/transactions/send', {
      method: 'POST',
      body: JSON.stringify({
        unsignedTx: tx,
        signature: signature
      })
    })
    */
  }
}
