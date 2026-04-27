import { WalletListEntry, WalletType } from '@alephium/shared'

import { sendAnalytics } from '~/analytics'
import { storage } from '~/persistent-storage/storage'
import { storeWithReportableError } from '~/persistent-storage/utils'

const WALLET_LIST_KEY = 'wallet-list'

export const getWalletList = (): WalletListEntry[] => {
  try {
    const raw = storage.getString(WALLET_LIST_KEY)

    return raw ? JSON.parse(raw) : []
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: 'Could not parse wallet list' })

    return []
  }
}

export const storeWalletList = (list: WalletListEntry[]) =>
  storeWithReportableError(WALLET_LIST_KEY, JSON.stringify(list))

export const walletListExists = (): boolean => getWalletList().length > 0

export const addWalletToList = (entry: WalletListEntry) => {
  const list = getWalletList()
  const existingIndex = list.findIndex((w) => w.id === entry.id)

  if (existingIndex >= 0) {
    list[existingIndex] = entry
  } else {
    list.push(entry)
  }

  storeWalletList(list)
}

export const removeWalletFromList = (walletId: string) => {
  const list = getWalletList().filter((w) => w.id !== walletId)

  storeWalletList(list)
}

export const updateWalletInList = (walletId: string, updates: Partial<Omit<WalletListEntry, 'id'>>) => {
  const list = getWalletList()
  const index = list.findIndex((w) => w.id === walletId)

  if (index >= 0) {
    list[index] = { ...list[index], ...updates }
    storeWalletList(list)
  }
}

export const getLastUsedWallet = (): WalletListEntry | undefined => {
  const list = getWalletList()

  if (list.length === 0) return undefined

  return list.reduce((latest, entry) => (entry.lastUsed > latest.lastUsed ? entry : latest))
}

export const getNextWalletOrder = (): number => {
  const list = getWalletList()

  if (list.length === 0) return 0

  return Math.max(...list.map((w) => w.order)) + 1
}

export const createWalletListEntry = (id: string, name: string, type: WalletType = 'seed'): WalletListEntry => ({
  id,
  name,
  type,
  lastUsed: Date.now(),
  order: getNextWalletOrder()
})
