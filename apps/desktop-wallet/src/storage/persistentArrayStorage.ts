import { StoredEncryptedWallet } from '@/types/wallet'

export class PersistentArrayStorage<T> {
  private localStorageKeyPrefix: string

  constructor(localStorageKeyPrefix: string) {
    this.localStorageKeyPrefix = localStorageKeyPrefix
  }

  getKey(id: StoredEncryptedWallet['id']) {
    if (!id) throw new Error('Wallet ID not set.')

    return `${this.localStorageKeyPrefix}-${id}`
  }

  load(walletId: StoredEncryptedWallet['id']) {
    const json = localStorage.getItem(this.getKey(walletId))

    if (json === null) return [] as T[]

    try {
      return JSON.parse(json) as T[]
    } catch {
      return [] as T[]
    }
  }

  store(walletId: StoredEncryptedWallet['id'], data: T[]) {
    localStorage.setItem(this.getKey(walletId), JSON.stringify(data))
  }

  delete(walletId: StoredEncryptedWallet['id']) {
    localStorage.removeItem(this.getKey(walletId))
  }
}
