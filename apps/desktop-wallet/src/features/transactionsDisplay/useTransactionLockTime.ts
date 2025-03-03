import { explorer as e } from '@alephium/web3'
import { useMemo } from 'react'

const useTransactionLockTime = (tx: e.Transaction | e.PendingTransaction) =>
  useMemo(() => {
    if (tx.outputs) {
      // TODO: The current algorithm finds lock time of ANY output that is the furthest in the future. But this is not
      // a good representation of a transaction lock time. Some of the transaction outputs might be locked, some might
      // not. We only care to see if the same outputs that are used to calculate the transaction delta amouts are also
      // locked. The algorithm needs to be rewored. See https://github.com/alephium/alephium-frontend/issues/550
      const latestLockTime = (tx.outputs as e.AssetOutput[]).reduce(
        (acc, output) => (acc > new Date(output.lockTime ?? 0) ? acc : new Date(output.lockTime ?? 0)),
        new Date(0)
      )

      return latestLockTime.toISOString() === new Date(0).toISOString() ? undefined : latestLockTime
    }
  }, [tx])

export default useTransactionLockTime
