import { selectSentTransactionByHash, sentTransactionStatusChanged } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { getPowfiSdk } from '~/api/powfi'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { sleep } from '~/utils/misc'

interface UsePendingStakingTxPollingProps {
  enabled?: boolean
  onConfirmed?: () => void
  txHash: string
}

const usePendingStakingTxPolling = ({ txHash, onConfirmed, enabled = true }: UsePendingStakingTxPollingProps) => {
  const dispatch = useAppDispatch()
  const powfi = getPowfiSdk()
  const sentTx = useAppSelector((s) => selectSentTransactionByHash(s, txHash))
  const onConfirmedRef = useRef(onConfirmed)

  useEffect(() => {
    onConfirmedRef.current = onConfirmed
  }, [onConfirmed])

  const txIsConfirmed = !sentTx || sentTx.status === 'confirmed'

  const { data: txStatus } = useQuery({
    queryKey: ['stakingTransaction', 'status', powfi?.network.id, txHash],
    enabled: enabled && !!powfi && !txIsConfirmed,
    refetchInterval: 3000,
    queryFn: async () => {
      await sleep(3000)

      try {
        const status = await powfi!.nodeProvider.transactions.getTransactionsStatus({ txId: txHash })
        return status.type
      } catch {
        return undefined
      }
    }
  })

  useEffect(() => {
    if (txStatus === 'MemPooled') {
      dispatch(sentTransactionStatusChanged({ hash: txHash, status: 'mempooled' }))
    } else if (txStatus === 'Confirmed') {
      dispatch(sentTransactionStatusChanged({ hash: txHash, status: 'confirmed' }))
      onConfirmedRef.current?.()
    }
  }, [dispatch, txHash, txStatus])
}

export default usePendingStakingTxPolling
