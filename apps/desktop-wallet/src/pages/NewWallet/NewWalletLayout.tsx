import AppHeader from '@/components/AppHeader'
import { StepsContextProvider } from '@/contexts/steps'
import { WalletContextProvider } from '@/contexts/wallet'
import LockedWalletLayout from '@/pages/LockedWalletLayout'

interface NewWalletLayoutProps {
  steps: JSX.Element[]
  baseUrl: 'import' | 'create'
}

const NewWalletLayout = ({ steps, baseUrl }: NewWalletLayoutProps) => (
  <LockedWalletLayout>
    <WalletContextProvider>
      <StepsContextProvider stepElements={steps} baseUrl={baseUrl} />
      <AppHeader invisible />
    </WalletContextProvider>
  </LockedWalletLayout>
)

export default NewWalletLayout
