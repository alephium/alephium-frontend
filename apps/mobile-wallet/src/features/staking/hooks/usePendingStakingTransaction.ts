import { selectAllPendingSentTransactions, selectDefaultAddress } from '@alephium/shared'
import { addressWithoutExplicitGroupIndex } from '@alephium/web3'
import { useMemo } from 'react'

import { useAppSelector } from '~/hooks/redux'

import useStakingContractConfig from './useStakingContractConfig'

const usePendingStakingTransaction = () => {
  const { stakingContractAddress } = useStakingContractConfig()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const pendingTransactions = useAppSelector(selectAllPendingSentTransactions)

  return useMemo(() => {
    const accountAddress = defaultAddress ? addressWithoutExplicitGroupIndex(defaultAddress.hash) : undefined

    if (!accountAddress) return undefined

    return pendingTransactions
      .filter((tx) => tx.fromAddress === accountAddress && tx.toAddress === stakingContractAddress)
      .sort((a, b) => b.timestamp - a.timestamp)[0]
  }, [defaultAddress, pendingTransactions, stakingContractAddress])
}

export default usePendingStakingTransaction
