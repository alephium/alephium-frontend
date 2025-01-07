import { ReactNode } from 'react'

import { UseFetchWalletBalancesAlphArrayContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphArray'
import { UseFetchWalletBalancesAlphByAddressContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphByAddress'
import { UseFetchWalletBalancesTokensArrayContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensArray'
import { UseFetchWalletBalancesTokensByAddressContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensByAddress'
import { UseFetchWalletTransactionsLimittedContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletTransactionsLimited'
import { composeProviders } from '@/api/context/apiContextUtils'

const Providers = composeProviders([
  UseFetchWalletBalancesTokensArrayContextProvider,
  UseFetchWalletBalancesTokensByAddressContextProvider,
  UseFetchWalletBalancesAlphArrayContextProvider,
  UseFetchWalletBalancesAlphByAddressContextProvider,
  UseFetchWalletTransactionsLimittedContextProvider
])

const ApiContextProvider = ({ children }: { children: ReactNode }) => <Providers>{children}</Providers>

export default ApiContextProvider
