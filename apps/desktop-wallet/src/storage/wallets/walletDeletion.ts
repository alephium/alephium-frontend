import { keyring } from '@alephium/keyring'
import { AnalyticsEvent } from '@alephium/shared'
import { activeWalletDeleted } from '@alephium/shared/store'
import type { PersistQueryClientContextType } from '@alephium/shared-react'

import type useAnalytics from '@/features/analytics/useAnalytics'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import type { AppDispatch } from '@/storage/store'
import { walletDeleted } from '@/storage/wallets/walletActions'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'
import type { StoredEncryptedWallet } from '@/types/wallet'

interface DeleteWalletProps {
  walletId: StoredEncryptedWallet['id']
  activeWalletId: StoredEncryptedWallet['id'] | undefined
  dispatch: AppDispatch
  deletePersistedCache: PersistQueryClientContextType['deletePersistedCache']
  sendAnalytics: ReturnType<typeof useAnalytics>['sendAnalytics']
}

export const deleteWallet = ({
  walletId,
  activeWalletId,
  dispatch,
  deletePersistedCache,
  sendAnalytics
}: DeleteWalletProps) => {
  walletStorage.delete(walletId)
  addressMetadataStorage.delete(walletId)

  deletePersistedCache(walletId)

  if (activeWalletId === walletId) {
    keyring.clear()
  }

  dispatch(walletId === activeWalletId ? activeWalletDeleted() : walletDeleted(walletId))

  sendAnalytics({ event: AnalyticsEvent.DELETED_WALLET })
}
