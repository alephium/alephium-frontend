import { ReactNode } from 'react'

import { UseFetchWalletBalancesAlphArrayContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlph'
import { UseFetchWalletBalancesAlphByAddressContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphByAddress'
import { UseFetchWalletBalancesTokensArrayContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensArray'
import { UseFetchWalletBalancesTokensByAddressContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensByAddress'
import { UseFetchWalletTransactionsLimitedContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletTransactionsLimited'
import { composeProviders } from '@/api/context/apiContextUtils'

const Providers = composeProviders([
  UseFetchWalletBalancesTokensArrayContextProvider,
  UseFetchWalletBalancesTokensByAddressContextProvider,
  UseFetchWalletBalancesAlphArrayContextProvider,
  UseFetchWalletBalancesAlphByAddressContextProvider,
  UseFetchWalletTransactionsLimitedContextProvider
])

const ApiContextProvider = ({ children }: { children: ReactNode }) => <Providers>{children}</Providers>

export default ApiContextProvider
