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

import { useQueries } from '@tanstack/react-query'

import { DataHook, SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineBalances } from '@/api/apiDataHooks/wallet/combineBalances'
import useFetchWalletLastTransactionHashes from '@/api/apiDataHooks/wallet/useFetchWalletLastTransactionHashes'
import { addressAlphBalancesQuery } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { DisplayBalances } from '@/types/tokens'

const useFetchWalletBalancesAlph = (props?: SkipProp): DataHook<DisplayBalances | undefined> => {
  const { data: latestTxHashes, isLoading: isLoadingLatestTxHashes } = useFetchWalletLastTransactionHashes(props)
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const { data, isLoading } = useQueries({
    queries: latestTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressAlphBalancesQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine: combineBalances
  })

  return {
    data: props?.skip ? undefined : data,
    isLoading: isLoading || isLoadingLatestTxHashes
  }
}

export default useFetchWalletBalancesAlph
