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

import { CliqueClient, ExplorerClient } from '@alephium/sdk'

import { defaultNetworkSettings } from '../storage/settings'
import { Address } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'
import { NetworkSettings } from '../types/settings'

export class Client {
  cliqueClient: CliqueClient
  explorerClient: ExplorerClient

  constructor({ nodeHost, explorerApiHost }: NetworkSettings) {
    this.cliqueClient = new CliqueClient({ baseUrl: nodeHost })
    this.explorerClient = new ExplorerClient({ baseUrl: explorerApiHost })
  }

  async init({ nodeHost, explorerApiHost }: NetworkSettings, isMultiNodesClique = false) {
    this.cliqueClient = new CliqueClient({ baseUrl: nodeHost })
    this.explorerClient = new ExplorerClient({ baseUrl: explorerApiHost })
    await this.cliqueClient.init(isMultiNodesClique)
  }

  async buildSweepTransactions(address: Address, toHash: AddressHash) {
    const { data } = await this.cliqueClient.transactionConsolidateUTXOs(address.publicKey, address.hash, toHash)
    const fees = data.unsignedTxs.reduce((acc, tx) => acc + BigInt(tx.gasPrice) * BigInt(tx.gasAmount), BigInt(0))

    return {
      unsignedTxs: data.unsignedTxs,
      fees
    }
  }

  async signAndSendTransaction(fromAddress: Address, txId: string, unsignedTx: string) {
    const signature = this.cliqueClient.transactionSign(txId, fromAddress.privateKey)
    const { data } = await this.cliqueClient.transactionSend(fromAddress.hash, unsignedTx, signature)

    return data
  }
}

const client = new Client(defaultNetworkSettings)

export default client
