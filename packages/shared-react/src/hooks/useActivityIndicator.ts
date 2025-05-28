import { explorer as e } from '@alephium/web3'
import { uniqBy } from 'lodash'
import { useEffect, useState } from 'react'

import { useFetchWalletTransactionsInfinite } from '@/api/apiDataHooks'

interface UseActivityIndicatorProps {
  isDisabled: boolean
}

export const useActivityIndicator = ({ isDisabled }: UseActivityIndicatorProps) => {
  const { data: fetchedConfirmedTxs, isLoading } = useFetchWalletTransactionsInfinite()

  const [prevLatestTxs, setPrevLatestTxs] = useState<e.Transaction[]>([])
  const [newTxCountIndicator, setNewTxCountIndicator] = useState(0)

  useEffect(() => {
    if (isDisabled) setNewTxCountIndicator(0)
  }, [isDisabled])

  useEffect(() => {
    if (fetchedConfirmedTxs.length === 0 || isLoading) {
      return
    }

    if (prevLatestTxs.length === 0) {
      setPrevLatestTxs(fetchedConfirmedTxs)
      return
    }

    const newTxCount = uniqBy(
      fetchedConfirmedTxs.filter((tx) => !prevLatestTxs.find((prevTx) => prevTx.hash === tx.hash)),
      'hash'
    ).length

    if (newTxCount > 0 && !isDisabled) {
      setNewTxCountIndicator((prev) => prev + newTxCount)
    }

    setPrevLatestTxs(fetchedConfirmedTxs)
  }, [fetchedConfirmedTxs, isLoading, isDisabled, prevLatestTxs])

  return newTxCountIndicator
}
