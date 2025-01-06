import { maxBy } from 'lodash'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import useFetchLatestTransactionOfEachAddress from '@/api/apiDataHooks/wallet/useFetchLatestTransactionOfEachAddress'

const useFetchWalletLatestTransaction = (props?: SkipProp) => {
  const { data: latestTxsOfEachAddress, isLoading } = useFetchLatestTransactionOfEachAddress(props)

  return {
    data: useMemo(
      () => maxBy(latestTxsOfEachAddress, (tx) => tx.latestTx?.timestamp)?.latestTx,
      [latestTxsOfEachAddress]
    ),
    isLoading
  }
}

export default useFetchWalletLatestTransaction
