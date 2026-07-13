import { AnalyticsEvent } from '@alephium/shared'
import { useFetchWalletWorth } from '@alephium/shared-react'
import { useEffect } from 'react'

import useAnalytics from '@/features/analytics/useAnalytics'
import { getIsWalletFunded, storeIsWalletFunded } from '@/features/analytics/walletFundedStorage'
import { useAppSelector } from '@/hooks/redux'

const useCaptureIsWalletFunded = () => {
  const { data: worth, isLoading } = useFetchWalletWorth()
  const { sendAnalytics } = useAnalytics()
  const walletId = useAppSelector((s) => s.activeWallet.id)
  const isAnalyticsEnabled = useAppSelector((s) => s.settings.analytics)

  useEffect(() => {
    if (!isAnalyticsEnabled) return

    if (!walletId || isLoading || !worth || worth <= 0 || getIsWalletFunded(walletId)) return

    storeIsWalletFunded(walletId, true)
    sendAnalytics({ event: AnalyticsEvent.WALLET_FUNDED })
  }, [walletId, worth, isLoading, sendAnalytics, isAnalyticsEnabled])
}

export default useCaptureIsWalletFunded
