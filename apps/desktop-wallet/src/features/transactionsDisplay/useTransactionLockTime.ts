/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { AssetOutput, Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useMemo } from 'react'

import { isPendingTx } from '@/features/transactionsDisplay/transactionDisplayUtils'
import { PendingTransaction } from '@/types/transactions'

const useTransactionLockTime = (tx: Transaction | PendingTransaction) =>
  useMemo(() => {
    if (isPendingTx(tx)) {
      if (tx.lockTime) return new Date(tx.lockTime)
    } else {
      if (tx.outputs) {
        // TODO: The current algorithm finds lock time of ANY output that is the furthest in the future. But this is not
        // a good representation of a transaction lock time. Some of the transaction outputs might be locked, some might
        // not. We only care to see if the same outputs that are used to calculate the transaction delta amouts are also
        // locked. The algorithm needs to be rewored. See https://github.com/alephium/alephium-frontend/issues/550
        const latestLockTime = (tx.outputs as AssetOutput[]).reduce(
          (acc, output) => (acc > new Date(output.lockTime ?? 0) ? acc : new Date(output.lockTime ?? 0)),
          new Date(0)
        )

        return latestLockTime.toISOString() === new Date(0).toISOString() ? undefined : latestLockTime
      }
    }
  }, [tx])

export default useTransactionLockTime
