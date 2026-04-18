import { hiddenTokensLoadedFromStorage, WalletMetadataMobile, walletSwitchedMobile } from '@alephium/shared'
import { usePersistQueryClientContext } from '@alephium/shared-react'
import { useCallback } from 'react'

import { getHiddenTokensIds } from '~/features/assetsDisplay/hideTokens/hiddenTokensStorage'
import { fundPasswordUseToggled } from '~/features/fund-password/fundPasswordActions'
import { hasStoredFundPassword } from '~/features/fund-password/fundPasswordStorage'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import {
  getStoredWalletMetadata,
  initializeKeyringWithStoredWallet,
  isStoredWalletMetadataMigrated
} from '~/persistent-storage/wallet'
import { updateWalletInList } from '~/persistent-storage/walletList'

const useWalletSwitch = () => {
  const dispatch = useAppDispatch()
  const currentWalletId = useAppSelector((s) => s.wallet.id)
  const { persistQueryCache, restoreQueryCache, clearQueryCache } = usePersistQueryClientContext()

  const switchWallet = useCallback(
    async (targetWalletId: string) => {
      if (targetWalletId === currentWalletId) return

      // 1. Persist current wallet's query cache before switching
      if (currentWalletId) {
        await persistQueryCache(currentWalletId)
      }

      // 2. Load target wallet metadata
      const metadata = await getStoredWalletMetadata(targetWalletId)

      if (!isStoredWalletMetadataMigrated(metadata)) {
        throw new Error('Cannot switch to wallet with unmigrated metadata')
      }

      // 3. Clear and restore target wallet's query cache BEFORE changing
      //    addresses. restoreQueryCache sets isRestoring=true (pausing queries),
      //    restores cached data, then sets isRestoring=false. During restore,
      //    old addresses are still in Redux but queries are paused so they
      //    won't refetch. This mirrors the desktop wallet's proven order.
      clearQueryCache()
      await restoreQueryCache(targetWalletId)

      // 4. Now switch wallet and load new addresses/contacts into Redux.
      //    When React renders after this dispatch, queries are created with the
      //    new address hashes and immediately find their data in the restored
      //    cache — no network requests needed.
      dispatch(walletSwitchedMobile(metadata as WalletMetadataMobile))

      // 5. Load target wallet's per-wallet data into Redux
      const hiddenTokens = getHiddenTokensIds(targetWalletId)
      dispatch(hiddenTokensLoadedFromStorage(hiddenTokens))

      const hasFundPw = await hasStoredFundPassword(targetWalletId)
      dispatch(fundPasswordUseToggled(hasFundPw))

      // 6. Update lastUsed in wallet list
      updateWalletInList(targetWalletId, { lastUsed: Date.now() })

      // 7. Initialize keyring with target wallet's mnemonic
      if (!metadata.type || metadata.type === 'seed') {
        await initializeKeyringWithStoredWallet(targetWalletId)
      }
    },
    [clearQueryCache, currentWalletId, dispatch, persistQueryCache, restoreQueryCache]
  )

  return { switchWallet }
}

export default useWalletSwitch
