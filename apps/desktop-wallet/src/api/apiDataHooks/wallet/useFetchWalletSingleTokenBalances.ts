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
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import useFetchWalletBalancesAlphArray from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphArray'
import { addressTokensBalancesQuery, AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'
import { ApiBalances, TokenId } from '@/types/tokens'

interface UseFetchWalletSingleTokenBalancesProps extends SkipProp {
  tokenId: TokenId
}

const useFetchWalletSingleTokenBalances = ({ tokenId, skip }: UseFetchWalletSingleTokenBalancesProps) => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const allAddressHashes = useUnsortedAddressesHashes()

  const isALPH = tokenId === ALPH.id

  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchWalletBalancesAlphArray()

  const { data: tokenBalances, isLoading: isLoadingTokenBalances } = useQueries({
    queries:
      !isALPH && !skip
        ? allAddressHashes.map((addressHash) => addressTokensBalancesQuery({ addressHash, networkId }))
        : [],
    combine: useMemo(
      () => (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => combineTokenBalances(tokenId, results),
      [tokenId]
    )
  })

  return {
    data: isALPH ? alphBalances : tokenBalances,
    isLoading: isALPH ? isLoadingAlphBalances : isLoadingTokenBalances
  }
}

export default useFetchWalletSingleTokenBalances

const combineTokenBalances = (tokenId: string, results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => ({
  data: results.reduce(
    (totalBalances, { data }) => {
      const balances = data?.balances.find(({ id }) => id === tokenId)

      totalBalances.totalBalance = (
        BigInt(totalBalances.totalBalance) + BigInt(balances ? balances.totalBalance : 0)
      ).toString()
      totalBalances.lockedBalance = (
        BigInt(totalBalances.lockedBalance) + BigInt(balances ? balances.lockedBalance : 0)
      ).toString()
      totalBalances.availableBalance = (
        BigInt(totalBalances.availableBalance) + BigInt(balances ? balances.availableBalance : 0)
      ).toString()

      return totalBalances
    },
    {
      totalBalance: '0',
      lockedBalance: '0',
      availableBalance: '0'
    } as ApiBalances
  ),
  ...combineIsLoading(results)
})
