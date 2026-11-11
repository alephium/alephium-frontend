import { usePendingTxPolling } from '@alephium/shared-react'
import { useEffect, useRef } from 'react'

interface MigrationTxPollerProps {
  txHash: string
  onTxConflicted: (txHash: string) => void
}

const MigrationTxPoller = ({ txHash, onTxConflicted }: MigrationTxPollerProps) => {
  const conflictReportedRef = useRef(false)

  const txStatus = usePendingTxPolling(txHash)

  useEffect(() => {
    if (txStatus === 'Conflicted' && !conflictReportedRef.current) {
      conflictReportedRef.current = true
      onTxConflicted(txHash)
    }
  }, [txStatus, onTxConflicted, txHash])

  return null
}

export default MigrationTxPoller
