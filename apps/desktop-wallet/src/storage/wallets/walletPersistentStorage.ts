import { orderBy } from 'lodash'
import { nanoid } from 'nanoid'
import posthog from 'posthog-js'

import { StoredEncryptedWallet } from '@/types/wallet'

class WalletStorage {
  private static localStorageKey = 'wallet'

  getKey(id: StoredEncryptedWallet['id']) {
    if (!id) throw new Error('Wallet ID not set.')

    return `${WalletStorage.localStorageKey}-${id}`
  }

  list(): StoredEncryptedWallet[] {
    const wallets = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)

      if (key?.startsWith(WalletStorage.localStorageKey)) {
        const data = localStorage.getItem(key)

        if (!data) continue

        try {
          const wallet = JSON.parse(data) as StoredEncryptedWallet
          if (!wallet.name) continue

          wallets.push(wallet)
        } catch (e) {
          console.error(e)
          posthog.capture('Error', { message: 'Parsing stored wallet data' })
          continue
        }
      }
    }

    return orderBy(wallets, (w) => w.name.toLowerCase())
  }

  load(id: StoredEncryptedWallet['id']): StoredEncryptedWallet {
    const data = localStorage.getItem(this.getKey(id))

    if (!data) throw new Error(`Unable to load wallet ${id}, wallet doesn't exist.`)

    return JSON.parse(data) as StoredEncryptedWallet
  }

  store(name: StoredEncryptedWallet['name'], encrypted: string): StoredEncryptedWallet {
    const id = nanoid()

    const dataToStore: StoredEncryptedWallet = {
      id,
      name,
      encrypted,
      lastUsed: Date.now(),
      isLedger: false
    }

    localStorage.setItem(this.getKey(id), JSON.stringify(dataToStore))

    return dataToStore
  }

  delete(id: StoredEncryptedWallet['id']) {
    localStorage.removeItem(this.getKey(id))
  }

  update(id: StoredEncryptedWallet['id'], data: Omit<Partial<StoredEncryptedWallet>, 'id'>) {
    const key = this.getKey(id)
    const walletRaw = localStorage.getItem(key)

    if (!walletRaw) throw new Error(`Unable to load wallet ${id}, wallet doesn't exist.`)

    const wallet = JSON.parse(walletRaw) as StoredEncryptedWallet

    localStorage.setItem(
      key,
      JSON.stringify({
        ...wallet,
        ...data
      })
    )
  }
}

export const walletStorage = new WalletStorage()
