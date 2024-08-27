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

import { AddressHash, calculateAmountWorth, TOKENS_QUERY_LIMIT } from '@alephium/shared'
import { useQueries } from '@tanstack/react-query'
import { chunk } from 'lodash'
import { useMemo } from 'react'

import useAddressesPricedFTs from '@/api/apiDataHooks/useAddressesPricedFTs'
import useAddressesTokensBalancesTotal from '@/api/apiDataHooks/useAddressesTokensBalancesTotal'
import { flatMapCombine } from '@/api/apiDataHooks/utils'
import { tokensPriceQuery } from '@/api/queries/priceQueries'
import { useAppSelector } from '@/hooks/redux'
import { TokenId } from '@/types/tokens'

interface AddressesTokensWorth {
  data: Record<TokenId, number | undefined>
  isLoading: boolean
}

const useAddressesTokensWorth = (addressHash?: AddressHash): AddressesTokensWorth => {
  const { data: tokenPrices, isLoading: isLoadingTokenPrices } = useAddressesTokensPrices()
  const { data: tokensWithPrice, isLoading: isLoadingTokensWithPrice } = useAddressesPricedFTs(addressHash)
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useAddressesTokensBalancesTotal(addressHash)

  const tokensWorth = useMemo(
    () =>
      tokensWithPrice.reduce(
        (tokensWorth, token) => {
          const totalTokenBalance = tokensBalances[token.id]?.totalBalance
          const tokenPrice = tokenPrices.find(({ symbol }) => symbol === token.symbol)

          if (totalTokenBalance && tokenPrice) {
            tokensWorth[token.id] =
              calculateAmountWorth(totalTokenBalance, tokenPrice.price, token.decimals) + (tokensWorth[token.id] ?? 0)
          }

          return tokensWorth
        },
        {} as AddressesTokensWorth['data']
      ),
    [tokenPrices, tokensBalances, tokensWithPrice]
  )

  return {
    data: tokensWorth,
    isLoading: isLoadingTokenPrices || isLoadingTokensWithPrice || isLoadingTokensBalances
  }
}

export default useAddressesTokensWorth

const useAddressesTokensPrices = () => {
  const currency = useAppSelector((s) => s.settings.fiatCurrency).toLowerCase()
  const { data: tokensWithPrice } = useAddressesPricedFTs()

  const { data, isLoading } = useQueries({
    queries: chunk(
      tokensWithPrice.map(({ symbol }) => symbol),
      TOKENS_QUERY_LIMIT
    ).map((symbols) => tokensPriceQuery({ symbols, currency })),
    combine: flatMapCombine
  })

  return {
    data,
    isLoading
  }
}
