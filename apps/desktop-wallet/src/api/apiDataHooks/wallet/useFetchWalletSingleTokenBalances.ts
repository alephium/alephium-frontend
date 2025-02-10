import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import useFetchWalletBalancesAlphArray from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphArray'
import { addressTokensBalancesQuery, AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { ApiBalances, TokenId } from '@/types/tokens'

interface UseFetchWalletSingleTokenBalancesProps extends SkipProp {
  tokenId: TokenId
}

const useFetchWalletSingleTokenBalances = ({ tokenId, skip }: UseFetchWalletSingleTokenBalancesProps) => {
  const networkId = useCurrentlyOnlineNetworkId()
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
