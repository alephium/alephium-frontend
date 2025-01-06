import { ExplorerProvider, NodeProvider } from '@alephium/web3'
import pThrottle from 'p-throttle'

import { defaultNetworkSettings } from '@/network'
import { NetworkSettings } from '@/types/network'

const throttle = pThrottle({
  limit: 10,
  interval: 1000
})

const throttledFetch = throttle((url, options = {}) => fetch(url, options))

class Client {
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
      explorer: new ExplorerProvider(explorerApiHost, undefined, throttledFetch),
      node: new NodeProvider(nodeHost, undefined, throttledFetch)
    }
  }
}

export const throttledClient = new Client()
