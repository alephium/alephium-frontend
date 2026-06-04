import { useMMKVString } from 'react-native-mmkv'

import { storage } from '~/persistent-storage/storage'

// Persists the hosts of unlisted (not in the alph.land directory) dApps that the user has explicitly acknowledged
// at sign time, so the extra "unverified dApp" confirmation is only shown once per dApp. Keyed per wallet, like
// authorized connections.

const acknowledgedUnverifiedDappsKey = (walletId: string) => `acknowledged-unverified-dapps-${walletId}`

const loadAcknowledgedUnverifiedDapps = (walletId: string): string[] => {
  const stored = storage.getString(acknowledgedUnverifiedDappsKey(walletId))

  if (!stored) return []

  try {
    return JSON.parse(stored) as string[]
  } catch {
    return []
  }
}

export const isUnverifiedDappAcknowledged = (walletId: string, host: string): boolean =>
  loadAcknowledgedUnverifiedDapps(walletId).includes(host)

export const acknowledgeUnverifiedDapp = (walletId: string, host: string) => {
  const acknowledged = loadAcknowledgedUnverifiedDapps(walletId)

  if (acknowledged.includes(host)) return

  storage.set(acknowledgedUnverifiedDappsKey(walletId), JSON.stringify([...acknowledged, host]))
}

export const clearAcknowledgedUnverifiedDapps = (walletId: string) => {
  storage.delete(acknowledgedUnverifiedDappsKey(walletId))
}

// Reactively returns how many unlisted dApps the user has acknowledged for the given wallet.
export const useAcknowledgedUnverifiedDappsCount = (walletId: string): number => {
  const [stored] = useMMKVString(acknowledgedUnverifiedDappsKey(walletId), storage)

  if (!stored) return 0

  try {
    return (JSON.parse(stored) as string[]).length
  } catch {
    return 0
  }
}
