import { FC, ReactNode } from 'react'

import { UseFetchWalletBalancesAlphContextProvider } from '../../api/apiDataHooks/wallet/useFetchWalletBalancesAlph'
import { UseFetchWalletBalancesByAddressContextProvider } from '../../api/apiDataHooks/wallet/useFetchWalletBalancesByAddress'
import { UseFetchWalletBalancesTokensArrayContextProvider } from '../../api/apiDataHooks/wallet/useFetchWalletBalancesTokensArray'
import { UseFetchWalletTokensByTypeContextProvider } from '../../api/apiDataHooks/wallet/useFetchWalletTokensByType'
import { useIsNodeOnline, useNetworkId } from '../../network/networkHooks'
import { useBalanceLockExpiry } from '../apiDataHooks/address/useBalanceLockExpiry'
import { useFetchWalletBalancesByAddress } from '../apiDataHooks/wallet/useFetchWalletBalancesByAddress'

type ProviderProps = { children: ReactNode }
type ProviderComponent = FC<ProviderProps>

const providers: Array<ProviderComponent> = [
  UseFetchWalletBalancesTokensArrayContextProvider,
  UseFetchWalletBalancesAlphContextProvider,
  UseFetchWalletTokensByTypeContextProvider,
  UseFetchWalletBalancesByAddressContextProvider
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

// One owner per address for lock discovery/timers, shared by desktop and mobile wallets.
const BalanceLockExpiry = ({ addressHash, lockedBalances }: { addressHash: string; lockedBalances: string }) => {
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()
  useBalanceLockExpiry({ addressHash, networkId, isNodeOnline, lockedBalances })

  return null
}

const BalanceLockExpiries = () => {
  const { data } = useFetchWalletBalancesByAddress()
  const networkId = useNetworkId()

  return Object.entries(data).map(([addressHash, balances]) => (
    <BalanceLockExpiry
      key={`${networkId}:${addressHash}`}
      addressHash={addressHash}
      lockedBalances={(balances ?? [])
        .filter(({ lockedBalance }) => lockedBalance !== '0')
        .map(({ id, lockedBalance }) => `${id}:${lockedBalance}`)
        .sort()
        .join(',')}
    />
  ))
}

export const ApiContextProvider = ({ children }: ProviderProps) => (
  <ComposedProviders>
    <BalanceLockExpiries />
    {children}
  </ComposedProviders>
)
