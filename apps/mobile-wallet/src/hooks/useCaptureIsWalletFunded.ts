import { AnalyticsEvent } from '@alephium/shared'
import { useFetchWalletWorth } from '@alephium/shared-react'
import { useEffect } from 'react'

import { sendAnalytics } from '~/analytics'
import { useAppSelector } from '~/hooks/redux'
import { getIsWalletFunded, storeIsWalletFunded } from '~/persistent-storage/wallet'

const useCaptureIsWalletFunded = () => {
  const { data: worth, isLoading } = useFetchWalletWorth()
  const walletId = useAppSelector((s) => s.wallet.id)

  useEffect(() => {
    if (!walletId || isLoading || !worth || worth <= 0 || getIsWalletFunded(walletId)) return

    storeIsWalletFunded(walletId, true)
    sendAnalytics({ event: AnalyticsEvent.WALLET_FUNDED })
  }, [walletId, worth, isLoading])
}

export default useCaptureIsWalletFunded
