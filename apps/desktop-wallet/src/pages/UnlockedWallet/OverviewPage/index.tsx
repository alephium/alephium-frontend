import styled from 'styled-components'

import { ShortcutButtonsGroupWallet } from '@/components/Buttons/ShortcutButtons'
import WorthOverviewPanel from '@/components/WorthOverviewPanel'
import { WalletTokensTabs } from '@/features/assetsLists/TokensTabs'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'

interface OverviewPageProps {
  className?: string
}

const OverviewPage = ({ className }: OverviewPageProps) => (
  <UnlockedWalletPage className={className}>
    <UnlockedWalletPanel bottom top>
      <WorthOverviewPanel>
        <Shortcuts>
          <ShortcutButtonsGroupWallet analyticsOrigin="overview_page" solidBackground />
        </Shortcuts>
      </WorthOverviewPanel>
    </UnlockedWalletPanel>
    <UnlockedWalletPanel bottom>
      <WalletTokensTabsStyled />
    </UnlockedWalletPanel>
  </UnlockedWalletPage>
)

export default styled(OverviewPage)`
  background-color: ${({ theme }) => theme.bg.background1};
`

const WalletTokensTabsStyled = styled(WalletTokensTabs)`
  flex: 2;
`

const Shortcuts = styled.div`
  align-items: center;
  justify-content: center;
`
