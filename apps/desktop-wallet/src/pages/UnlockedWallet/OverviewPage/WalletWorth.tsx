import { memo } from 'react'

import useFetchWalletWorth from '@/api/apiDataHooks/wallet/useFetchWalletWorth'
import WorthOverview from '@/components/WorthOverview'

interface WalletWorthProps {
  overrideWorth?: number
}

const WalletWorth = memo((props: WalletWorthProps) => {
  const { data: worth, isLoading, isFetching, error } = useFetchWalletWorth()

  return <WorthOverview worth={worth} isLoading={isLoading} isFetching={isFetching} error={error} {...props} />
})

export default WalletWorth
