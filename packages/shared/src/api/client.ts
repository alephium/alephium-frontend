import { ExplorerProvider, NodeProvider } from '@alephium/web3'

import { throttledExponentialBackoffFetchRetry } from '@/api/fetchRetry'
import { defaultNetworkSettings } from '@/network'
import { NetworkSettings } from '@/types/network'

export class Client {
  explorer: ExplorerProvider
  node: NodeProvider

  constructor() {
    const { nodeHost, explorerApiHost } = defaultNetworkSettings
    const { explorer, node } = this.getClients(nodeHost, explorerApiHost)

    this.explorer = explorer
    this.node = node
  }

  init(nodeHost: NetworkSettings['nodeHost'], explorerApiHost: NetworkSettings['explorerApiHost']) {
    const { explorer, node } = this.getClients(nodeHost, explorerApiHost)

    this.explorer = explorer
    this.node = node
  }

  private getClients(nodeHost: NetworkSettings['nodeHost'], explorerApiHost: NetworkSettings['explorerApiHost']) {
    return {
      explorer: new ExplorerProvider(explorerApiHost, undefined, throttledExponentialBackoffFetchRetry),
      node: new NodeProvider(nodeHost, undefined, throttledExponentialBackoffFetchRetry)
    }
  }
}

export const client = new Client()
