import { selectSentTransactionByHash } from '@alephium/shared'
import { usePendingTxPolling } from '@alephium/shared-react'
import { useEffect, useRef } from 'react'
import { ActivityIndicator } from 'react-native'

import { useAppSelector } from '~/hooks/redux'

interface PendingStakingActionPollerIndicatorProps {
  txHash: string
  onTxConfirmed: () => void
}

const PendingStakingActionPollerIndicator = ({ txHash, onTxConfirmed }: PendingStakingActionPollerIndicatorProps) => {
  const confirmedRef = useRef(false)
  const sentTx = useAppSelector((s) => selectSentTransactionByHash(s, txHash))

  usePendingTxPolling(txHash)

  useEffect(() => {
    if (sentTx?.status === 'confirmed' && !confirmedRef.current) {
      confirmedRef.current = true
      onTxConfirmed()
    }
  }, [sentTx?.status, onTxConfirmed])

  return <ActivityIndicator color="white" size="small" />
}

export default PendingStakingActionPollerIndicator
