import { useEffect } from 'react'

import { useAppSelector } from '@/hooks/redux'
import { persistWalletQueryCache } from '@/storage/tanstackQueryCache/tanstackIndexedDBPersister'

let preventMainWindowClose = true

const usePersistQueryCacheBeforeQuit = () => {
  const walletId = useAppSelector((s) => s.activeWallet.id)
  const isPassphraseUsed = useAppSelector((s) => s.activeWallet.isPassphraseUsed)

  useEffect(() => {
    if (walletId && !isPassphraseUsed) {
      window.onbeforeunload = async (e) => {
        if (preventMainWindowClose) {
          e.preventDefault()

          await persistWalletQueryCache(walletId)

          preventMainWindowClose = false
        }

        window.electron?.window.close()
        window.close()
      }
    }

    const removeBeforeQuitListener = window.electron?.app.onBeforeQuit(async () => {
      if (walletId && !isPassphraseUsed) {
        await persistWalletQueryCache(walletId)

        window.onbeforeunload = null
      }

      window.electron?.app.quit()
    })

    return () => {
      removeBeforeQuitListener && removeBeforeQuitListener()
    }
  }, [walletId, isPassphraseUsed])
}

export default usePersistQueryCacheBeforeQuit
