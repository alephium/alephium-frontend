import { useMemo } from 'react'

import { useFetchLatestTransactionOfEachAddress } from '../../../api/apiDataHooks/wallet/useFetchLatestTransactionOfEachAddress'

export const useFetchWalletLatestTransaction = () => {
  const { data: latestTxsOfEachAddress, isLoading } = useFetchLatestTransactionOfEachAddress()

  return {
    data: useMemo(
      () =>
        latestTxsOfEachAddress.reduce(
          (max, tx) => ((tx.latestTx?.timestamp ?? 0) > (max?.latestTx?.timestamp ?? 0) ? tx : max),
          latestTxsOfEachAddress[0]
        )?.latestTx,
      [latestTxsOfEachAddress]
    ),
    isLoading
  }
}
