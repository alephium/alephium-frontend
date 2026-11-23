import { selectSentTransactionByHash } from '@alephium/shared/store'
import { nodeTransactionStatusQuery, useIsNodeOnline, useNetworkId, usePendingTxPolling } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { useAppSelector } from '~/hooks/redux'

interface MigrationTxPollerProps {
  txHash: string
  onTxConflicted: (txHash: string) => void
}

const MigrationTxPoller = ({ txHash, onTxConflicted }: MigrationTxPollerProps) => {
  const sentTx = useAppSelector((s) => selectSentTransactionByHash(s, txHash))
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()
  const conflictReportedRef = useRef(false)

  usePendingTxPolling(txHash)

  const { data: txStatus } = useQuery(
    nodeTransactionStatusQuery({ txHash, networkId, isNodeOnline, skip: sentTx?.status === 'confirmed' })
  )

  useEffect(() => {
    if (txStatus === 'Conflicted' && !conflictReportedRef.current) {
      conflictReportedRef.current = true
      onTxConflicted(txHash)
    }
  }, [txStatus, onTxConflicted, txHash])

  return null
}

export default MigrationTxPoller
