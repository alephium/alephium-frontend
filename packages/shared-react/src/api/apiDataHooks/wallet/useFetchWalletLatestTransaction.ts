import { maxBy } from 'lodash'
import { useMemo } from 'react'

import { useFetchLatestTransactionOfEachAddress } from '@/api/apiDataHooks/wallet/useFetchLatestTransactionOfEachAddress'

export const useFetchWalletLatestTransaction = () => {
  const { data: latestTxsOfEachAddress, isLoading } = useFetchLatestTransactionOfEachAddress()

  return {
    data: useMemo(
      () => maxBy(latestTxsOfEachAddress, (tx) => tx.latestTx?.timestamp)?.latestTx,
      [latestTxsOfEachAddress]
    ),
    isLoading
  }
}
