import { ReactNode } from 'react'

type ProviderProps = { children: ReactNode }
type ProviderComponent = FC<ProviderProps>

export const composeProviders = (providers: ProviderComponent[]): ProviderComponent =>
  providers.reduce<ProviderComponent>(
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
