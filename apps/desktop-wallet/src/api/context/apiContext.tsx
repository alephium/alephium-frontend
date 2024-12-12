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

import { ReactNode } from 'react'

import { UseFetchWalletBalancesAlphArrayContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphArray'
import { UseFetchWalletBalancesAlphByAddressContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphByAddress'
import { UseFetchWalletBalancesTokensArrayContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensArray'
import { UseFetchWalletBalancesTokensByAddressContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensByAddress'
import { composeProviders } from '@/api/context/apiContextUtils'

const Providers = composeProviders([
  UseFetchWalletBalancesTokensArrayContextProvider,
  UseFetchWalletBalancesTokensByAddressContextProvider,
  UseFetchWalletBalancesAlphArrayContextProvider,
  UseFetchWalletBalancesAlphByAddressContextProvider
])

const ApiContextProvider = ({ children }: { children: ReactNode }) => <Providers>{children}</Providers>

export default ApiContextProvider
