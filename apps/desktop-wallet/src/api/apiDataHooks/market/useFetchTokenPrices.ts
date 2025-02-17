import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
import { tokensPriceQuery } from '@/api/queries/priceQueries'
import { useAppSelector } from '@/hooks/redux'

const useFetchTokenPrices = (props?: SkipProp) => {
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const networkIsOffline = useCurrentlyOnlineNetworkId() === undefined

  const { data: symbols, isLoading: isLoadingFtSymbols } = useFetchWalletFtsSymbols()

  const { data, isLoading } = useQuery(
    tokensPriceQuery({
      symbols,
      currency: fiatCurrency.toLowerCase(),
      skip: props?.skip || networkIsOffline
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
  const networkIsOffline = useCurrentlyOnlineNetworkId() === undefined

  const { data: symbols, isLoading: isLoadingFtSymbols } = useFetchWalletFtsSymbols()

  const { data, isLoading } = useQuery({
    ...tokensPriceQuery({ symbols, currency: fiatCurrency.toLowerCase(), skip: networkIsOffline }),
    select: (data) => data.find((tokenPrice) => tokenPrice.symbol === symbol)?.price
  })

  return {
    data,
    isLoading: isLoading || isLoadingFtSymbols
  }
}

const useFetchWalletFtsSymbols = () => {
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
