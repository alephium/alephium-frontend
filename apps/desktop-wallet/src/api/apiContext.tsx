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

import { DisplayBalances } from '@alephium/shared'
import { TokenInfo } from '@alephium/token-list'
import { createContext, useContext } from 'react'

import { useAddressesAlphBalances, useAddressesTokensBalances } from '@/api/addressesBalancesDataHooks'
import {
  useAddressesListedFungibleTokens,
  useAddressesUnlistedFungibleTokens
} from '@/api/addressesFungibleTokensInfoDataHooks'
import { useAddressesTokensWorth } from '@/api/addressesFungibleTokensPricesDataHooks'

interface ApiContextValue {
  alphBalances?: DisplayBalances
  isLoadingAlphBalances: boolean
  tokensBalances: Record<string, DisplayBalances | undefined>
  isLoadingTokensBalances: boolean
  tokensWorth: Record<string, number | undefined>
  isLoadingTokensWorth: boolean
  listedFT: TokenInfo[]
  isLoadingListedFT: boolean
  unlistedFT: Omit<TokenInfo, 'description' | 'logoURI'>[] // TODO: Put somewhere else
  isLoadingUnlistedFT: boolean
}

const ApiContext = createContext<ApiContextValue>({
  alphBalances: undefined,
  isLoadingAlphBalances: false,
  tokensBalances: {},
  isLoadingTokensBalances: false,
  tokensWorth: {},
  isLoadingTokensWorth: false,
  listedFT: [],
  isLoadingListedFT: false,
  unlistedFT: [],
  isLoadingUnlistedFT: false
})

export const ApiContextProvider: FC = ({ children }) => {
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useAddressesAlphBalances()
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useAddressesTokensBalances()
  const { data: tokensWorth, isLoading: isLoadingTokensWorth } = useAddressesTokensWorth()
  const { data: listedFT, isLoading: isLoadingListedFT } = useAddressesListedFungibleTokens()
  const { data: unlistedFT, isLoading: isLoadingUnlistedFT } = useAddressesUnlistedFungibleTokens()

  console.log('Context re-renders')

  return (
    <ApiContext.Provider
      value={{
        alphBalances,
        isLoadingAlphBalances,
        tokensBalances,
        isLoadingTokensBalances,
        tokensWorth,
        isLoadingTokensWorth,
        listedFT,
        isLoadingListedFT,
        unlistedFT,
        isLoadingUnlistedFT
      }}
    >
      {children}
    </ApiContext.Provider>
  )
}

export const useApiContext = () => useContext(ApiContext)
