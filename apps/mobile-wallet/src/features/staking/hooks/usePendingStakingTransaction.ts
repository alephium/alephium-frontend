import { selectAllPendingSentTransactions } from '@alephium/shared'
import { useMemo } from 'react'

import { useAppSelector } from '~/hooks/redux'

import usePowfiSdk from './usePowfiSdk'

const usePendingStakingTransaction = () => {
  const sdk = usePowfiSdk()
  const pendingTransactions = useAppSelector(selectAllPendingSentTransactions)

  const stakingContractAddress = useMemo(() => {
    try {
      return sdk.staking.getConfig().xAlphTokenAddress
    } catch {
      return ''
    }
  }, [sdk])

  return useMemo(() => {
    let accountAddress: string | undefined

    try {
      accountAddress = sdk.account.address
    } catch {
      accountAddress = undefined
    }

    if (!accountAddress) return undefined

    return pendingTransactions
      .filter((tx) => tx.fromAddress === accountAddress && tx.toAddress === stakingContractAddress)
      .sort((a, b) => b.timestamp - a.timestamp)[0]
  }, [pendingTransactions, sdk, stakingContractAddress])
}

export default usePendingStakingTransaction
