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

import { StoredWallet } from '@/types/wallet'

export class PersistentArrayStorage<T> {
  private localStorageKeyPrefix: string

  constructor(localStorageKeyPrefix: string) {
    this.localStorageKeyPrefix = localStorageKeyPrefix
  }

  getKey(id: StoredWallet['id']) {
    if (!id) throw new Error('Wallet ID not set.')

    return `${this.localStorageKeyPrefix}-${id}`
  }

  load(walletId: StoredWallet['id']) {
    const json = localStorage.getItem(this.getKey(walletId))

    return json === null ? [] : (JSON.parse(json) as T[])
  }

  store(walletId: StoredWallet['id'], data: T[]) {
    localStorage.setItem(this.getKey(walletId), JSON.stringify(data))
  }

  delete(walletId: StoredWallet['id']) {
    localStorage.removeItem(this.getKey(walletId))
  }
}
