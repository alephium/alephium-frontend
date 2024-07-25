/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { AddressHash, CHART_DATE_FORMAT, client, ONE_DAY_MS, TokenHistoricalPrice } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import { useQueries, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { useAppSelector } from '@/hooks/redux'

const HISTORY_QUERY_KEY = 'history'
const DAILY = explorer.IntervalType.Daily

type Timestamp = string
type Amount = string

const useHistoricData = () => {
  const allAddressHashes = useAppSelector((s) => s.addresses.ids as AddressHash[])
  const currency = useAppSelector((s) => s.settings.fiatCurrency).toLowerCase()
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const { data: alphPriceHistory, isLoading: isLoadingAlphPriceHistory } = useQuery({
    queryKey: [HISTORY_QUERY_KEY, 'price', ALPH.symbol, { currency }],
    queryFn: () =>
      client.explorer.market.getMarketPricesSymbolCharts(ALPH.symbol, { currency }).then((rawHistory) => {
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
  })

  const {
    data: alphBalanceHistoryPerAddress,
    isLoading: isLoadingHistoricalAlphBalances,
    hasHistoricBalances
  } = useQueries({
    queries: allAddressHashes.map((hash) => ({
      queryKey: [HISTORY_QUERY_KEY, 'addressBalance', DAILY, ALPH.symbol, { hash, networkId }],
      queryFn: async () => {
        const now = dayjs()
        const thisMoment = now.valueOf()
        const oneYearAgo = now.subtract(365, 'days').valueOf()

        const { amountHistory } = await client.explorer.addresses.getAddressesAddressAmountHistory(hash, {
          fromTs: oneYearAgo,
          toTs: thisMoment,
          'interval-type': DAILY
        })

        return {
          address: hash,
          amountHistory
        }
      },
      staleTime: ONE_DAY_MS
    })),
    combine: (results) => ({
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
      isLoading: results.some(({ isLoading }) => isLoading),
      hasHistoricBalances: results.some(({ data }) => data?.amountHistory?.length)
    })
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
