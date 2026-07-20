import { usePersistQueryClientContext } from '@alephium/shared-react'
import { useEffect } from 'react'

import { useAppSelector } from '@/hooks/redux'

let preventMainWindowClose = true

const usePersistQueryCacheBeforeQuit = () => {
  const walletId = useAppSelector((s) => s.activeWallet.id)
  const isPassphraseUsed = useAppSelector((s) => s.activeWallet.isPassphraseUsed)
  const { persistQueryCache } = usePersistQueryClientContext()

  useEffect(() => {
    if (walletId && !isPassphraseUsed) {
      window.onbeforeunload = async (e) => {
        if (preventMainWindowClose) {
          e.preventDefault()

          await persistQueryCache(walletId)

          preventMainWindowClose = false
        }

        window.electron?.window.close()
        window.close()
      }
    } else {
      // Without this, closing the app while the wallet is locked runs the handler of the previously active wallet,
      // persisting the cleared query cache over the one that was saved when the wallet got locked.
      window.onbeforeunload = null
    }

    const removeBeforeQuitListener = window.electron?.app.onBeforeQuit(async () => {
      if (walletId && !isPassphraseUsed) {
        await persistQueryCache(walletId)

        window.onbeforeunload = null
      }

      window.electron?.app.quit()
    })

    return () => {
      removeBeforeQuitListener && removeBeforeQuitListener()
    }
  }, [walletId, isPassphraseUsed, persistQueryCache])
}

export default usePersistQueryCacheBeforeQuit
