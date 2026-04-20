import { AddressHash } from '@alephium/shared'
import { addressLatestTransactionQuery, useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { ActivityIndicator } from 'react-native'

interface PendingStakingActionPollerIndicatorProps {
  addressHash: AddressHash
  onNewTxDetected: () => void
}

const PendingStakingActionPollerIndicator = ({
  addressHash,
  onNewTxDetected
}: PendingStakingActionPollerIndicatorProps) => {
  const networkId = useCurrentlyOnlineNetworkId()
  const latestTxHashRef = useRef<string>(undefined)

  const { data: newLatestTransaction } = useQuery({
    ...addressLatestTransactionQuery({ addressHash, networkId }),
    refetchInterval: 3000
  })

  useEffect(() => {
    if (latestTxHashRef.current) return
    latestTxHashRef.current = newLatestTransaction?.latestTx?.hash
  }, [newLatestTransaction])

  useEffect(() => {
    if (newLatestTransaction?.latestTx?.hash !== latestTxHashRef.current) {
      onNewTxDetected()
      latestTxHashRef.current = newLatestTransaction?.latestTx?.hash
    }
  }, [newLatestTransaction?.latestTx?.hash, onNewTxDetected])

  return <ActivityIndicator color="white" size="small" />
}

export default PendingStakingActionPollerIndicator
