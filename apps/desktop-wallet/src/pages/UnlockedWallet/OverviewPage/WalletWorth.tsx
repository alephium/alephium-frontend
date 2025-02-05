import { memo } from 'react'

import useFetchWalletWorth from '@/api/apiDataHooks/wallet/useFetchWalletWorth'
import WorthOverview from '@/components/WorthOverview'

const WalletWorth = memo(() => {
  const { data: worth, isLoading, isFetching, error } = useFetchWalletWorth()

  return <WorthOverview worth={worth} isLoading={isLoading} isFetching={isFetching} error={error} />
})

export default WalletWorth
