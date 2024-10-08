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

import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import useFetchLatestTransactionOfEachAddress from '@/api/apiDataHooks/wallet/useFetchLatestTransactionOfEachAddress'

const useFetchWalletLatestTransaction = (props?: SkipProp) => {
  const { data: latestTxsOfEachAddress, isLoading } = useFetchLatestTransactionOfEachAddress(props)

  return {
    data: useMemo(
      () =>
        latestTxsOfEachAddress.reduce(
          (latestWalletTx, latestAddressTx) =>
            (latestAddressTx?.latestTx?.timestamp ?? 0) > (latestWalletTx?.timestamp ?? 0)
              ? latestAddressTx?.latestTx
              : latestWalletTx,
          undefined as Transaction | undefined
        ),
      [latestTxsOfEachAddress]
    ),
    isLoading
  }
}

export default useFetchWalletLatestTransaction
