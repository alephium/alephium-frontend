import { ONE_DAY_MS, ONE_MINUTE_MS } from '@alephium/shared'
import { explorer } from '@alephium/web3'

import { getHashrateTimeInterval, getTimeIntervals } from './timeIntervals'

const { Daily, Hourly } = explorer.IntervalType

const now = Date.UTC(2024, 4, 15, 8, 12, 3, 456)
const oneSecondLater = now + 1000
const endOfSameMinute = Date.UTC(2024, 4, 15, 8, 12, 59, 999)
const oneMinuteLater = now + ONE_MINUTE_MS
const laterInTheSameHour = Date.UTC(2024, 4, 15, 8, 47, 0, 0)
const laterInTheSameDay = Date.UTC(2024, 4, 15, 21, 47, 0, 0)

const allIntervalsAt = (timestamp: number) => [
  getTimeIntervals(Daily, timestamp),
  getTimeIntervals(Hourly, timestamp),
  getHashrateTimeInterval(timestamp)
]

it('Should return identical intervals for two viewers polling one second apart', () => {
  expect(allIntervalsAt(now)).toEqual(allIntervalsAt(oneSecondLater))
})

it('Should return identical intervals for two moments of the same minute', () => {
  expect(allIntervalsAt(now)).toEqual(allIntervalsAt(endOfSameMinute))
})

it('Should return fresh intervals one minute later', () => {
  expect(getTimeIntervals(Daily, now)).not.toEqual(getTimeIntervals(Daily, oneMinuteLater))
  expect(getTimeIntervals(Hourly, now)).not.toEqual(getTimeIntervals(Hourly, oneMinuteLater))
  expect(getHashrateTimeInterval(now)).not.toEqual(getHashrateTimeInterval(oneMinuteLater))
})

it('Should move the end of the interval forward by exactly one minute', () => {
  expect(getHashrateTimeInterval(oneMinuteLater).to - getHashrateTimeInterval(now).to).toEqual(ONE_MINUTE_MS)
})

// The hashrate is a headline number on the homepage: bucketing it to the hour, or the chart series to the day, would
// leave them sitting on a stale value for far longer than anyone would fail to notice.
it('Should not hold on to the same interval for a whole hour', () => {
  expect(getHashrateTimeInterval(now)).not.toEqual(getHashrateTimeInterval(laterInTheSameHour))
  expect(getTimeIntervals(Hourly, now)).not.toEqual(getTimeIntervals(Hourly, laterInTheSameHour))
})

it('Should not hold on to the same interval for a whole day', () => {
  expect(getTimeIntervals(Daily, now)).not.toEqual(getTimeIntervals(Daily, laterInTheSameDay))
})

it('Should floor both boundaries to the current minute', () => {
  const flooredNow = Date.UTC(2024, 4, 15, 8, 12)
  const oneMonthEarlier = Date.UTC(2024, 3, 15, 8, 12)

  expect(getTimeIntervals(Daily, now)).toEqual({ from: oneMonthEarlier, to: flooredNow })
  expect(getTimeIntervals(Hourly, now)).toEqual({ from: flooredNow - 2 * ONE_DAY_MS, to: flooredNow })
  expect(getHashrateTimeInterval(now)).toEqual({ from: flooredNow - ONE_DAY_MS, to: flooredNow })
})

it('Should never end the interval more than a minute in the past', () => {
  for (const { to } of allIntervalsAt(now)) {
    expect(now - to).toBeGreaterThanOrEqual(0)
    expect(now - to).toBeLessThan(ONE_MINUTE_MS)
  }
})

it('Should default to the current time', () => {
  vi.useFakeTimers()
  vi.setSystemTime(oneSecondLater)

  expect([getTimeIntervals(Daily), getTimeIntervals(Hourly), getHashrateTimeInterval()]).toEqual(allIntervalsAt(now))

  vi.useRealTimers()
})
