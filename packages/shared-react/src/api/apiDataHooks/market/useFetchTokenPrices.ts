import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'

import { useFetchWalletTokensByType } from '../../../api/apiDataHooks/wallet/useFetchWalletTokensByType'
import { tokensPriceQuery } from '../../../api/queries/priceQueries'
import { useNetworkId } from '../../../network/networkHooks'
import { useSharedSelector } from '../../../redux'

export const useFetchTokenPrices = () => {
  const fiatCurrency = useSharedSelector((s) => s.sharedSettings.fiatCurrency)
  const networkId = useNetworkId()

  const { data: symbols, isLoading: isLoadingFtSymbols } = useFetchWalletFtsSortedSymbols()

  const {
    data,
    isLoading: isLoadingTokenPrices,
    isFetching,
    error,
    refetch
  } = useQuery(
    tokensPriceQuery({
      symbols,
      currency: fiatCurrency.toLowerCase(),
      networkId,
      skip: isLoadingFtSymbols
    })
  )

  // tokensPriceQuery keys on (currency, networkId) only, so switching to a wallet that holds different tokens changes
  // the requested symbols without changing the key and triggers no refetch. Force one whenever the cached prices don't
  // cover the current symbols, otherwise the worth skeleton hangs until the next refetch interval.
  const hasUncoveredSymbols =
    !!data && symbols.some((symbol) => !data.some((tokenPrice) => tokenPrice.symbol === symbol))

  useEffect(() => {
    if (!isLoadingFtSymbols && !isFetching && !error && hasUncoveredSymbols) {
      refetch()
    }
  }, [error, hasUncoveredSymbols, isFetching, isLoadingFtSymbols, refetch])

  return {
    data,
    error,
    isLoading: isLoadingFtSymbols || isLoadingTokenPrices
  }
}

export const useFetchTokenPrice = (symbol: string) => {
  const fiatCurrency = useSharedSelector((s) => s.sharedSettings.fiatCurrency)
  const networkId = useNetworkId()

  const { data: symbols, isLoading: isLoadingFtSymbols } = useFetchWalletFtsSortedSymbols()

  const { data, isLoading } = useQuery({
    ...tokensPriceQuery({ symbols, currency: fiatCurrency.toLowerCase(), networkId }),
    select: (data) => data.find((tokenPrice) => tokenPrice.symbol === symbol)?.price
  })

  return {
    data,
    isLoading: isLoading || isLoadingFtSymbols
  }
}

const useFetchWalletFtsSortedSymbols = () => {
  const {
    data: { listedFts },
    isLoading: isLoadingTokensByType
  } = useFetchWalletTokensByType({ includeHidden: true })

  const symbols = useMemo(() => listedFts.map((ft) => ft.symbol), [listedFts])

  return {
    data: symbols,
    isLoading: isLoadingTokensByType
  }
}
