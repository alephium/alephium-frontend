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

import { keyring } from '@alephium/keyring'
import { exponentialBackoffFetchRetry } from '@alephium/shared'
import { ExplorerProvider } from '@alephium/web3'

interface WorkerPayload {
  data: {
    clientUrl: string
    skipIndexes?: number[]
  }
}

self.onmessage = ({ data: { clientUrl, skipIndexes } }: WorkerPayload) => {
  const client = new ExplorerProvider(clientUrl, undefined, exponentialBackoffFetchRetry)

  discover(client, skipIndexes)
}

const discover = async (client: ExplorerProvider, skipIndexes?: number[]) => {
  try {
    const activeAddresses = await keyring.discoverAndCacheActiveAddresses(client, skipIndexes)
    self.postMessage(activeAddresses)
  } catch (e) {
    console.error(e)
  }
}
