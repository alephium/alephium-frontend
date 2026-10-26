import { selectSentTransactionByHash, sentTransactionStatusChanged } from '@alephium/shared/store'
import { nodeTransactionStatusQuery, useIsNodeOnline, useNetworkId, usePendingTxPolling } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { useAppDispatch, useAppSelector } from '~/hooks/redux'

interface MigrationTxPollerProps {
  txHash: string
  onTxConflicted: (txHash: string) => void
}

const MigrationTxPoller = ({ txHash, onTxConflicted }: MigrationTxPollerProps) => {
  const dispatch = useAppDispatch()
  const sentTx = useAppSelector((s) => selectSentTransactionByHash(s, txHash))
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()
  const conflictReportedRef = useRef(false)

  usePendingTxPolling(txHash)

  const { data: nodeTxStatus } = useQuery(
    nodeTransactionStatusQuery({ txHash, networkId, isNodeOnline, skip: sentTx?.status === 'confirmed' })
  )

  useEffect(() => {
    if (nodeTxStatus === 'Conflicted' && !conflictReportedRef.current) {
      conflictReportedRef.current = true
      onTxConflicted(txHash)
    }
  }, [nodeTxStatus, onTxConflicted, txHash])

  useEffect(() => {
    if (nodeTxStatus === 'Confirmed' && sentTx && sentTx.status !== 'confirmed')
      dispatch(sentTransactionStatusChanged({ hash: txHash, status: 'confirmed' }))
  }, [dispatch, nodeTxStatus, sentTx, txHash])

  return null
}

export default MigrationTxPoller
