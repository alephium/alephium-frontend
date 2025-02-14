import { ReactNode } from 'react'

import { UseFetchWalletBalancesAlphArrayContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlph'
import { UseFetchWalletBalancesAlphByAddressContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphByAddress'
import { UseFetchWalletBalancesTokensArrayContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensArray'
import { UseFetchWalletBalancesTokensByAddressContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensByAddress'
import { UseFetchWalletTokensByTypeContextProvider } from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
type ProviderProps = { children: ReactNode }
type ProviderComponent = FC<ProviderProps>

const providers: Array<ProviderComponent> = [
  UseFetchWalletBalancesTokensArrayContextProvider,
  UseFetchWalletBalancesTokensByAddressContextProvider,
  UseFetchWalletBalancesAlphArrayContextProvider,
  UseFetchWalletBalancesAlphByAddressContextProvider,
  UseFetchWalletTokensByTypeContextProvider
]

const ComposedProviders = providers.reduce<ProviderComponent>(
  (AccumulatedProviders, CurrentProvider) => {
    const CombinedProvider: ProviderComponent = ({ children }) => (
      <AccumulatedProviders>
        <CurrentProvider>{children}</CurrentProvider>
      </AccumulatedProviders>
    )

    return CombinedProvider
  },
  ({ children }) => children
)

const ApiContextProvider = ({ children }: ProviderProps) => <ComposedProviders>{children}</ComposedProviders>

export default ApiContextProvider
