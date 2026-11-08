import { AddressHash } from '@alephium/shared/types'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { addressLockTimesQuery } from '../../../api/queries/addressQueries'
import { invalidateAddressQueries } from '../../../api/queryInvalidation'

// JS timers overflow beyond ~24.8 days. Re-arm long locks without invalidating early.
export const scheduleLockExpiry = (timestamp: number, callback: () => void) => {
  let timer: ReturnType<typeof setTimeout>
  const arm = () => {
    const remaining = timestamp - Date.now()
    if (remaining <= 0) callback()
    else timer = setTimeout(arm, Math.min(remaining, 2 ** 31 - 1))
  }
  arm()

  return () => clearTimeout(timer)
}

const RETRY_INTERVAL = 10000

interface Props {
  addressHash: AddressHash
  networkId: number
  isNodeOnline: boolean
  // Stable sorted token/locked-amount pairs, or empty when nothing is locked.
  lockedBalances: string
}

export const useBalanceLockExpiry = ({ addressHash, networkId, isNodeOnline, lockedBalances }: Props) => {
  const [expiredBalances, setExpiredBalances] = useState('')
  const enabled = isNodeOnline && !!lockedBalances
  const lockTimes = useQuery({
    ...addressLockTimesQuery({ addressHash, networkId, isNodeOnline, skip: !lockedBalances }),
    enabled
  })
  const nextExpiry = lockTimes.data?.reduce<number | undefined>(
    (next, timestamp) => (timestamp > Date.now() && (next === undefined || timestamp < next) ? timestamp : next),
    undefined
  )

  useEffect(() => {
    if (!enabled || nextExpiry === undefined) return

    return scheduleLockExpiry(nextExpiry, () => {
      setExpiredBalances(lockedBalances)
      void invalidateAddressQueries(addressHash, networkId)
    })
  }, [addressHash, networkId, enabled, lockedBalances, nextExpiry])

  // A local clock reaching lockTime does not guarantee the node/explorer has indexed the unlocking block yet.
  // Retry only while that expiry has not changed the locked balance, or lock discovery failed/found no future lock.
  // Cleanup on unmount/network change removes both timers; no always-on balance polling is introduced.
  useEffect(() => {
    if (!enabled) return
    const needsRetry =
      expiredBalances === lockedBalances || lockTimes.isError || (lockTimes.isSuccess && nextExpiry === undefined)
    if (!needsRetry) return

    const timer = setTimeout(() => {
      void invalidateAddressQueries(addressHash, networkId)
    }, RETRY_INTERVAL)

    return () => clearTimeout(timer)
  }, [
    addressHash,
    networkId,
    enabled,
    lockedBalances,
    expiredBalances,
    lockTimes.isError,
    lockTimes.isSuccess,
    lockTimes.dataUpdatedAt,
    lockTimes.errorUpdatedAt,
    nextExpiry
  ])
}
