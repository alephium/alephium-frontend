import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
import { tokensPriceQuery } from '@/api/queries/priceQueries'
import { useAppSelector } from '@/hooks/redux'

const useFetchTokenPrices = () => {
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const networkId = useCurrentlyOnlineNetworkId()

  const { data: symbols, isLoading: isLoadingFtSymbols } = useFetchWalletFtsSortedSymbols()

  const { data, isLoading } = useQuery(
    tokensPriceQuery({
      symbols,
      currency: fiatCurrency.toLowerCase(),
      networkId: networkId
    })
  )

  return {
    data,
    isLoading: isLoading || isLoadingFtSymbols
  }
}

export default useFetchTokenPrices

export const useFetchTokenPrice = (symbol: string) => {
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const networkId = useCurrentlyOnlineNetworkId()

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
