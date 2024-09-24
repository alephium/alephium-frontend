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

import { PersistedClient, Persister } from '@tanstack/react-query-persist-client'
import { del, get, set } from 'idb-keyval'

/**
 * Creates an Indexed DB persister
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 * @see https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient#building-a-persister
 */
const createTanstackIndexedDBPersister = (idbValidKey: IDBValidKey = 'tanstackQuery') =>
  ({
    persistClient: async (client: PersistedClient) => {
      await set(idbValidKey, client)
    },
    restoreClient: async () => await get<PersistedClient>(idbValidKey),
    removeClient: async () => {
      await del(idbValidKey)
    }
  }) as Persister

const tanstackIndexedDBPersister = createTanstackIndexedDBPersister()

export default tanstackIndexedDBPersister
