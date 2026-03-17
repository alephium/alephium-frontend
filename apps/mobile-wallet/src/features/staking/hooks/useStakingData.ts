import { useFetchWalletBalancesAlph, useFetchWalletSingleTokenBalances } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Decimal from 'decimal.js'
import { useMemo } from 'react'

import { formatTokenAmount } from '../stakingUtils'
import usePowfiSdk from './usePowfiSdk'

const useStakingData = () => {
  const sdk = usePowfiSdk()
  const queryClient = useQueryClient()
  const { data: alphBalances } = useFetchWalletBalancesAlph()
  const networkId = sdk.network.id

  const xAlphTokenId = useMemo(() => {
    try {
      return sdk.staking.getConfig().xAlphTokenId
    } catch {
      return undefined
    }
  }, [sdk])

  const {
    data: tokenState,
    isLoading: isTokenStateLoading,
    refetch: refetchTokenState
  } = useQuery({
    queryKey: ['xAlphTokenState', networkId],
    queryFn: () => sdk.staking.getXAlphTokenState(),
    staleTime: 60_000,
    refetchInterval: 60_000
  })

  const xAlphRate = useMemo(() => {
    if (!tokenState?.fields.totalXAlphSupply) return new Decimal(1)
    if (!tokenState?.fields.totalDepositedAlph) return new Decimal(0)

    return new Decimal(tokenState.fields.totalDepositedAlph.toString()).div(
      tokenState.fields.totalXAlphSupply.toString()
    )
  }, [tokenState])

  const { data: walletTokenBalances, isLoading: isXAlphBalanceLoading } = useFetchWalletSingleTokenBalances({
    tokenId: xAlphTokenId ?? ''
  })

  const xAlphBalance = walletTokenBalances?.totalBalance ? BigInt(walletTokenBalances.totalBalance) : BigInt(0)
  const xAlphDecimal = useMemo(() => new Decimal(xAlphBalance.toString()), [xAlphBalance])
  const stakedValueDecimal = useMemo(() => xAlphDecimal.mul(xAlphRate), [xAlphDecimal, xAlphRate])
  const stakedValueAlph = BigInt(stakedValueDecimal.toDecimalPlaces(0, Decimal.ROUND_DOWN).toFixed(0))

  const availableToStake = BigInt(alphBalances?.availableBalance ?? '0')

  const formattedStakedValue = formatTokenAmount(stakedValueAlph, ALPH.decimals)
  const formattedXAlphBalance = formatTokenAmount(xAlphBalance, ALPH.decimals)
  const formattedXAlphRate = xAlphRate.toFixed(4)
  const formattedAvailableToStake = formatTokenAmount(availableToStake, ALPH.decimals)

  const refresh = async () => {
    await Promise.all([refetchTokenState(), queryClient.invalidateQueries({ queryKey: ['address'] })])
  }

  return {
    stakedValueAlph,
    xAlphBalance,
    xAlphRate,
    xAlphTokenId,
    availableToStake,
    formattedStakedValue,
    formattedXAlphBalance,
    formattedXAlphRate,
    formattedAvailableToStake,
    isLoading: isTokenStateLoading || isXAlphBalanceLoading,
    refresh
  }
}

export default useStakingData
