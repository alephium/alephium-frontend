import { ExplorerProvider, NodeProvider, TransactionBuilder } from '@alephium/web3'
import pThrottle from 'p-throttle'

import { defaultNetworkSettings } from '@/network'
import { NetworkSettings } from '@/types/network'

const throttle = pThrottle({
  limit: 10,
  interval: 1000
})

export const throttledFetch = throttle((url, options = {}) => fetch(url, options))

class Client {
  explorer: ExplorerProvider
  node: NodeProvider
  txBuilder: TransactionBuilder

  constructor() {
    const { nodeHost, explorerApiHost } = defaultNetworkSettings
    const { explorer, node, txBuilder } = this.getClients(nodeHost, explorerApiHost)

    this.explorer = explorer
    this.node = node
    this.txBuilder = txBuilder
  }

  init(nodeHost: NetworkSettings['nodeHost'], explorerApiHost: NetworkSettings['explorerApiHost']) {
    const { explorer, node, txBuilder } = this.getClients(nodeHost, explorerApiHost)

    this.explorer = explorer
    this.node = node
    this.txBuilder = txBuilder
  }

  private getClients(nodeHost: NetworkSettings['nodeHost'], explorerApiHost: NetworkSettings['explorerApiHost']) {
    const explorer = new ExplorerProvider(explorerApiHost, undefined, throttledFetch)
    const node = new NodeProvider(nodeHost, undefined, throttledFetch)
    const txBuilder = TransactionBuilder.from(nodeHost, undefined, throttledFetch)

    return {
      explorer,
      node,
      txBuilder
    }
  }
}

export const throttledClient = new Client()
