import { useFetchWalletWorth } from '@alephium/shared-react'
import { memo } from 'react'

import WorthOverview from '@/components/WorthOverview'
import useCaptureIsWalletFunded from '@/features/analytics/useCaptureIsWalletFunded'

const WalletWorth = memo(() => {
  const { data: worth, isLoading, isFetching, error } = useFetchWalletWorth()

  useCaptureIsWalletFunded()

  return <WorthOverview worth={worth} isLoading={isLoading} isFetching={isFetching} error={!!error} />
})

export default WalletWorth
