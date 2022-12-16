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

import { defaultNetworkSettings } from '../persistent-storage/settings'
import { AddressHash } from '../types/addresses'
import { NetworkSettings } from '../types/settings'

export class Client {
  cliqueClient: CliqueClient
  explorerClient: ExplorerClient

  constructor({ nodeHost, explorerApiHost }: NetworkSettings) {
    this.cliqueClient = new CliqueClient({ baseUrl: nodeHost })
    this.explorerClient = new ExplorerClient({ baseUrl: explorerApiHost })
  }

  async init(
    nodeHost: NetworkSettings['nodeHost'],
    explorerApiHost: NetworkSettings['explorerApiHost'],
    isMultiNodesClique = false
  ) {
    this.cliqueClient = new CliqueClient({ baseUrl: nodeHost })
    this.explorerClient = new ExplorerClient({ baseUrl: explorerApiHost })
    await this.cliqueClient.init(isMultiNodesClique)
  }

  async buildSweepTransactions(fromHash: AddressHash, fromPublicKey: string, toHash: AddressHash) {
    const { data } = await this.cliqueClient.transactionConsolidateUTXOs(fromPublicKey, fromHash, toHash)
    const fees = data.unsignedTxs.reduce((acc, tx) => acc + BigInt(tx.gasPrice) * BigInt(tx.gasAmount), BigInt(0))

    return {
      unsignedTxs: data.unsignedTxs,
      fees
    }
  }

  async signAndSendTransaction(fromHash: AddressHash, fromPrivateKey: string, txId: string, unsignedTx: string) {
    const signature = this.cliqueClient.transactionSign(txId, fromPrivateKey)
    const { data } = await this.cliqueClient.transactionSend(fromHash, unsignedTx, signature)

    return data
  }

  async fetchAddressesData(addressHashes: AddressHash[]) {
    const results = []

    for (const addressHash of addressHashes) {
      console.log('⬇️ Fetching address details: ', addressHash)
      const { data } = await this.explorerClient.getAddressDetails(addressHash)
      const availableBalance = data.balance
        ? data.lockedBalance
          ? (BigInt(data.balance) - BigInt(data.lockedBalance)).toString()
          : data.balance
        : undefined

      console.log('⬇️ Fetching 1st page of address confirmed transactions: ', addressHash)
      const { data: transactions } = await this.explorerClient.getAddressTransactions(addressHash, 1)

      console.log('⬇️ Fetching address tokens: ', addressHash)
      const { data: tokenIds } = await this.explorerClient.addresses.getAddressesAddressTokens(addressHash)

      const tokens = await Promise.all(
        tokenIds.map((id) =>
          this.explorerClient.addresses.getAddressesAddressTokensTokenIdBalance(addressHash, id).then(({ data }) => ({
            id,
            balances: data
          }))
        )
      )

      results.push({
        hash: addressHash,
        details: data,
        availableBalance: availableBalance,
        transactions,
        tokens
      })
    }

    return results
  }
}

const client = new Client(defaultNetworkSettings)

export default client
