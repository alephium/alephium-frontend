/* eslint-disable @typescript-eslint/no-explicit-any */

import { NetworkPreset, throttledFetch } from '@alephium/shared'
import { ExplorerProvider, NodeProvider } from '@alephium/web3'

import { getNetworkSettings } from '@/api/getNetworkSettings'

export class Client {
  explorer: ExplorerProvider
  node: NodeProvider
  networkType: NetworkPreset

  constructor() {
    const { node, explorer, networkType } = this.getClients()
    this.node = node
    this.explorer = explorer
    this.networkType = networkType
  }

  private getClients() {
    const { nodeUrl, explorerUrl, netType } = getNetworkSettings()

    return {
      node: new NodeProvider(nodeUrl, undefined, throttledFetch),
      explorer: new ExplorerProvider(explorerUrl, undefined, throttledFetch),
      networkType: netType
    }
  }
}

const client = new Client()

export default client
