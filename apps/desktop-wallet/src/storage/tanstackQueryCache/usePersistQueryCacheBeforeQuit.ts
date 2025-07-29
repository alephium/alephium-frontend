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
