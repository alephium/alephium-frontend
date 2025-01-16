import styled from 'styled-components'

import AnimatedBackground from '@/components/AnimatedBackground'
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
    <AnimatedBackground />
    <UnlockedWalletPanel bottom top>
      <TopPanelContainer>
        <WorthOverviewPanel />
        <Shortcuts>
          <ShortcutButtonsGroupWallet analyticsOrigin="overview_page" solidBackground />
        </Shortcuts>
      </TopPanelContainer>
    </UnlockedWalletPanel>
    <UnlockedWalletPanel bottom>
      <WalletTokensTabsStyled />
    </UnlockedWalletPanel>
  </UnlockedWalletPage>
)

export default styled(OverviewPage)`
  background-color: ${({ theme }) => theme.bg.background1};
`

const TopPanelContainer = styled.div`
  display: flex;
  gap: 20px;
`

const WalletTokensTabsStyled = styled(WalletTokensTabs)`
  flex: 2;
`

const Shortcuts = styled.div`
  align-items: center;
  justify-content: center;
`
