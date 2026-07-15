import { ONE_DAY_MS, ONE_MINUTE_MS } from '@alephium/shared'
import { explorer } from '@alephium/web3'

export interface TimeInterval {
  from: number
  to: number
}

// Raw Date.now() boundaries make every poll and every viewer request a unique, uncacheable URL. Flooring to the minute
// gives all viewers one shared URL an edge cache can collapse, while keeping the data at most a minute stale.
const BUCKET_SIZE_MS = ONE_MINUTE_MS

const floorToBucket = (timestamp: number) => timestamp - (timestamp % BUCKET_SIZE_MS)

export const getTimeIntervals = (timeInterval: explorer.IntervalType, now: number = Date.now()): TimeInterval => {
  const to = floorToBucket(now)

  if (timeInterval === explorer.IntervalType.Daily) {
    const from = new Date(to)
    from.setUTCMonth(from.getUTCMonth() - 1)

    return { from: from.getTime(), to }
  }

  return { from: to - 2 * ONE_DAY_MS, to }
}

export const getHashrateTimeInterval = (now: number = Date.now()): TimeInterval => {
  const to = floorToBucket(now)

  return { from: to - ONE_DAY_MS, to }
}
