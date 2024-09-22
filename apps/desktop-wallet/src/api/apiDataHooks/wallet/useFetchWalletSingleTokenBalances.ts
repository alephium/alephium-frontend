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

import { ALPH } from '@alephium/token-list'
import { useQueries } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/types'
import { combineBalances } from '@/api/apiDataHooks/wallet/combineBalances'
import useFetchWalletBalancesAlph from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlph'
import useFetchWalletLastTransactionHashes from '@/api/apiDataHooks/wallet/useFetchWalletLastTransactionHashes'
import { addressSingleTokenBalancesQuery } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { TokenId } from '@/types/tokens'

interface UseFetchWalletSingleTokenBalancesProps extends SkipProp {
  tokenId: TokenId
}

const useFetchWalletSingleTokenBalances = ({ tokenId, skip }: UseFetchWalletSingleTokenBalancesProps) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const { data: latestTxHashes, isLoading: isLoadingLatestTxHashes } = useFetchWalletLastTransactionHashes({ skip })

  const isALPH = tokenId === ALPH.id

  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchWalletBalancesAlph({
    skip: !isALPH || skip
  })

  const { data: tokenBalances, isLoading: isLoadingTokenBalances } = useQueries({
    queries:
      !isALPH && !skip
        ? latestTxHashes.map((props) => addressSingleTokenBalancesQuery({ ...props, tokenId, networkId }))
        : [],
    combine: combineBalances
  })

  return {
    data: isALPH ? alphBalances : tokenBalances,
    isLoading: isLoadingLatestTxHashes || isLoadingTokenBalances || isLoadingAlphBalances
  }
}

export default useFetchWalletSingleTokenBalances
