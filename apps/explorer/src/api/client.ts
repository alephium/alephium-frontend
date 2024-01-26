/*
Copyright 2018 - 2024 The Alephium Authors
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ExplorerProvider, NodeProvider } from '@alephium/web3'

import { NetworkType, networkTypes } from '@/types/network'

export class Client {
  explorer: ExplorerProvider
  node: NodeProvider
  networkType: NetworkType

  constructor() {
    const { node, explorer, networkType } = this.getClients()
    this.node = node
    this.explorer = explorer
    this.networkType = networkType
  }

  private getClients() {
    let explorerUrl: string | null | undefined = (window as any).VITE_BACKEND_URL
    let nodeUrl: string | null | undefined = (window as any).VITE_NODE_URL

    let netType = (window as any).VITE_NETWORK_TYPE as NetworkType

    if (!explorerUrl || !nodeUrl) {
      explorerUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9090'
      nodeUrl = import.meta.env.VITE_NODE_URL || 'http://localhost:12973'
      netType = (import.meta.env.VITE_NETWORK_TYPE || 'testnet') as NetworkType

      console.info(`
        • DEVELOPMENT MODE •

        Using local env. variables if available.
        You can set them using a .env file placed at the project's root.

        - Backend URL: ${explorerUrl}
        - Node URL: ${nodeUrl}
        - Network Type: ${netType}
      `)
    }

    if (!explorerUrl) {
      throw new Error('The VITE_BACKEND_URL environment variable must be defined')
    }

    if (!nodeUrl) {
      throw new Error('The VITE_NODE_URL environment variable must be defined')
    }

    if (!netType) {
      throw new Error('The VITE_NETWORK_TYPE environment variable must be defined')
    } else if (!networkTypes.includes(netType)) {
      throw new Error('Value of the VITE_NETWORK_TYPE environment variable is invalid')
    }

    return {
      node: new NodeProvider(nodeUrl, undefined, (info, init) => fetch(info, init)),
      explorer: new ExplorerProvider(explorerUrl, undefined, (info, init) => fetch(info, init)),
      networkType: netType
    }
  }
}

const client = new Client()

export default client
