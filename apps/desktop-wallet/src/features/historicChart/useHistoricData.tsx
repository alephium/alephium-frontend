import { AddressHash, CHART_DATE_FORMAT, ONE_DAY_MS, throttledClient, TokenHistoricalPrice } from '@alephium/shared'
import { getQueryConfig, useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { explorer as e } from '@alephium/web3'
import { skipToken, useQueries, useQuery, UseQueryResult } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { useAppSelector } from '@/hooks/redux'

const DAILY = e.IntervalType.Daily

type Timestamp = string
type Amount = string

const useHistoricData = () => {
  const allAddressHashes = useAppSelector((s) => s.addresses.ids as AddressHash[])
  const currency = useAppSelector((s) => s.settings.fiatCurrency).toLowerCase()
  const networkId = useCurrentlyOnlineNetworkId()

  const { data: alphPriceHistory, isLoading: isLoadingAlphPriceHistory } = useQuery({
    queryKey: ['history', 'price', ALPH.symbol, { currency }],
    // We don't want to delete the price history if the user stays on a page without a chart for too long
    ...getQueryConfig({ staleTime: ONE_DAY_MS, gcTime: Infinity }),
    queryFn:
      networkId !== undefined
        ? () =>
            throttledClient.explorer.market
              .getMarketPricesSymbolCharts(ALPH.symbol, { currency })
              .then((rawHistory) => {
                const today = dayjs().format(CHART_DATE_FORMAT)
                const history = [] as TokenHistoricalPrice[]

                if (rawHistory.timestamps && rawHistory.prices) {
                  for (let index = 0; index < rawHistory.timestamps.length; index++) {
                    const timestamp = rawHistory.timestamps[index]
                    const price = rawHistory.prices[index]

                    const itemDate = dayjs(timestamp).format(CHART_DATE_FORMAT)
                    const prevItemDate =
                      index > 1 ? dayjs(rawHistory.timestamps[index - 1]).format(CHART_DATE_FORMAT) : undefined

                    if (itemDate !== prevItemDate && itemDate !== today) {
                      history.push({
                        date: itemDate,
                        value: price
                      })
                    }
                  }
                }

                return history
              })
        : skipToken
  })

  const {
    data: alphBalanceHistoryPerAddress,
    isLoading: isLoadingHistoricalAlphBalances,
    hasHistoricBalances
  } = useQueries({
    queries:
      networkId !== undefined
        ? allAddressHashes.map((hash) => ({
            queryKey: ['address', hash, 'history', 'addressBalance', DAILY, ALPH.symbol, { networkId }],
            // We don't want to delete the balance history if the user stays on a page without a chart for too long
            ...getQueryConfig({ staleTime: ONE_DAY_MS, gcTime: Infinity, networkId }),
            queryFn: async () => {
              const now = dayjs()
              const thisMoment = now.valueOf()
              const oneYearAgo = now.subtract(365, 'days').valueOf()

              const { amountHistory } = await throttledClient.explorer.addresses.getAddressesAddressAmountHistory(
                hash,
                {
                  fromTs: oneYearAgo,
                  toTs: thisMoment,
                  'interval-type': DAILY
                }
              )

              return {
                address: hash,
                amountHistory
              }
            }
          }))
        : [],
    combine
  })

  return {
    alphBalanceHistoryPerAddress,
    isLoadingHistoricalAlphBalances,
    isLoadingAlphPriceHistory,
    alphPriceHistory,
    isLoading: isLoadingAlphPriceHistory || isLoadingHistoricalAlphBalances,
    hasHistoricBalances
  }
}

export default useHistoricData

const combine = (
  results: UseQueryResult<{
    address: AddressHash
    amountHistory: e.AmountHistory['amountHistory']
  }>[]
) => ({
  data: results.reduce(
    (historyPerAddress, { data }) => {
      if (data) {
        historyPerAddress[data.address] = !data.amountHistory
          ? undefined
          : data.amountHistory.reduce(
              (amountPerDate, [timestamp, amount]) => {
                const date = dayjs(timestamp).format(CHART_DATE_FORMAT)
                amountPerDate[date] = amount

                return amountPerDate
              },
              {} as Record<Timestamp, Amount>
            )
      }

      return historyPerAddress
    },
    {} as Record<AddressHash, Record<Timestamp, Amount> | undefined>
  ),
  ...combineIsLoading(results),
  hasHistoricBalances: results.some(({ data }) => data?.amountHistory?.length)
})
