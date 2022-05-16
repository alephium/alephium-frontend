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
}

const client = new Client(defaultNetworkSettings)

export default client
