import styled from 'styled-components'

import SideBarSettingsButton from '@/components/PageComponents/SideBarSettingsButton'
import { useAppSelector } from '@/hooks/redux'
import LockedWalletLayout from '@/pages/LockedWalletLayout'
import WelcomePageWithExistingWallets from '@/pages/welcomePage/WelcomePageWithExistingWallets'
import WelcomePageWithoutExistingWallets from '@/pages/welcomePage/WelcomePageWithoutExistingWallets'

const WelcomePage = () => {
  const hasAtLeastOneWallet = useAppSelector((s) => s.global.wallets.length > 0)

  return (
    <LockedWalletLayout>
      {hasAtLeastOneWallet ? <WelcomePageWithExistingWallets /> : <WelcomePageWithoutExistingWallets />}

      <SettingsButtonStyled />
    </LockedWalletLayout>
  )
}

export default WelcomePage

const SettingsButtonStyled = styled(SideBarSettingsButton)`
  position: absolute;
  bottom: var(--spacing-2);
  left: var(--spacing-2);
  width: auto;
`
