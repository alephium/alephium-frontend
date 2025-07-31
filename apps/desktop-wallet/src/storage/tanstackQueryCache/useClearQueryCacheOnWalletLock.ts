import { usePersistQueryClientContext } from '@alephium/shared-react'
import { useEffect } from 'react'

import { useAppSelector } from '@/hooks/redux'

const useClearQueryCacheOnWalletLock = () => {
  const walletId = useAppSelector((s) => s.activeWallet.id)
  const { clearQueryCache } = usePersistQueryClientContext()

  useEffect(() => {
    if (!walletId) {
      clearQueryCache()
    }
  }, [clearQueryCache, walletId])
}

export default useClearQueryCacheOnWalletLock
