import { appLaunchedWithLastUsedWallet } from '@alephium/shared'
import { usePersistQueryClientContext } from '@alephium/shared-react'
import { useEffect, useState } from 'react'

import { useAppDispatch } from '~/hooks/redux'
import { useAsyncData } from '~/hooks/useAsyncData'
import { getStoredWalletMetadataWithoutThrowingError } from '~/persistent-storage/wallet'

const useIsQueryCacheRestored = () => {
  const dispatch = useAppDispatch()
  const { data: walletMetadata } = useAsyncData(getStoredWalletMetadataWithoutThrowingError)
  const { restoreQueryCache } = usePersistQueryClientContext()

  const [isQueryCacheRestored, setIsQueryCacheRestored] = useState(false)

  useEffect(() => {
    if (walletMetadata === undefined) {
      return
    } else if (walletMetadata === null) {
      setIsQueryCacheRestored(true)
    } else {
      dispatch(appLaunchedWithLastUsedWallet(walletMetadata))
      restoreQueryCache(walletMetadata.id)
        .then(() => {
          setIsQueryCacheRestored(true)
        })
        .catch(() => {
          setIsQueryCacheRestored(true)
        })
    }
  }, [dispatch, restoreQueryCache, walletMetadata])

  return isQueryCacheRestored
}

export default useIsQueryCacheRestored
