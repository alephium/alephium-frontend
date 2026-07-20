import { useEffect } from 'react'

import { invalidateTokenResolutionFallbacks } from '../../api/queryInvalidation'
import { useIsExplorerOnline } from '../../network/networkHooks'

// Token queries cache fallback results (see isTokenResolutionFallback) when their data cannot be fetched, so that the
// UI keeps working while offline. Once the explorer comes back online, refetch them to replace the fallbacks with real
// data.
export const useRecoverTokenResolutionFallbacks = () => {
  const isExplorerOnline = useIsExplorerOnline()

  useEffect(() => {
    if (!isExplorerOnline) return

    invalidateTokenResolutionFallbacks()
  }, [isExplorerOnline])
}
