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

import { ExplorerProvider, NodeProvider, throttledFetch } from '@alephium/web3'

import { defaultNetworkSettings } from '~/persistent-storage/settings'
import { NetworkSettings } from '~/types/settings'

export class Client {
  node: NodeProvider
  explorer: ExplorerProvider

  constructor({ nodeHost, explorerApiHost }: NetworkSettings) {
    this.node = new NodeProvider(nodeHost, undefined, throttledFetch(5))
    this.explorer = new ExplorerProvider(explorerApiHost, undefined, throttledFetch(5))
  }

  init(nodeHost: NetworkSettings['nodeHost'], explorerApiHost: NetworkSettings['explorerApiHost']) {
    this.node = new NodeProvider(nodeHost, undefined, throttledFetch(5))
    this.explorer = new ExplorerProvider(explorerApiHost, undefined, throttledFetch(5))
  }
}

const client = new Client(defaultNetworkSettings)

export default client
