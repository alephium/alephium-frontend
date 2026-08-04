import { useEffect, useMemo, useState } from 'react'

import { useFetchLatestTransactionOfEachAddress } from '../api/apiDataHooks/wallet/useFetchLatestTransactionOfEachAddress'

interface UseActivityIndicatorProps {
  isDisabled: boolean
}

export const useActivityIndicator = ({ isDisabled }: UseActivityIndicatorProps) => {
  const { data: latestTxOfEachAddress, isLoading } = useFetchLatestTransactionOfEachAddress()

  const [seenTxHashes, setSeenTxHashes] = useState<Set<string>>(new Set())
  const [newTxCountIndicator, setNewTxCountIndicator] = useState(0)

  // Counted from the poll rather than from the list, whose rows arrive in bulk once it can load at all, so a list
  // recovering from a rate limit would read as a burst of arrivals. The price is one hash per address, so several
  // transactions arriving on the same address between two polls count as one.
  const latestTxHashes = useMemo(
    () => new Set(latestTxOfEachAddress.flatMap(({ latestTx }) => (latestTx ? [latestTx.hash] : []))),
    [latestTxOfEachAddress]
  )

  useEffect(() => {
    if (isDisabled) setNewTxCountIndicator(0)
  }, [isDisabled])

  useEffect(() => {
    if (latestTxHashes.size === 0 || isLoading) {
      return
    }

    if (seenTxHashes.size === 0) {
      setSeenTxHashes(latestTxHashes)
      return
    }

    const newTxCount = [...latestTxHashes].filter((hash) => !seenTxHashes.has(hash)).length

    if (newTxCount > 0 && !isDisabled) {
      setNewTxCountIndicator((prev) => prev + newTxCount)
    }

    setSeenTxHashes(latestTxHashes)
  }, [latestTxHashes, isLoading, isDisabled, seenTxHashes])

  return newTxCountIndicator
}
