import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import AnimatedBackground from '@/components/AnimatedBackground'
import { ShortcutButtonsGroupWallet } from '@/components/Buttons/ShortcutButtons'
import LabeledWorthOverview from '@/components/LabeledWorthOverview'
import { WalletTokensTabs } from '@/features/assetsLists/AddressDetailsTabs'
import WalletWorth from '@/pages/unlockedWallet/overviewPage/WalletWorth'
import { UnlockedWalletPanel } from '@/pages/unlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/unlockedWallet/UnlockedWalletPage'
interface OverviewPageProps {
  className?: string
}

const OverviewPage = ({ className }: OverviewPageProps) => {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <UnlockedWalletPage className={className}>
      <AnimatedBackground anchorPosition="top" opacity={theme.name === 'dark' ? 0.4 : 0.5} verticalOffset={-100} />
      <WorthUnlockedWalletPanel bottom>
        <WorthOverviewPanel>
          <LabeledWorthOverview label={t('Wallet worth')}>
            <WalletWorth />
          </LabeledWorthOverview>
          <Shortcuts>
            <ShortcutButtonsGroupWallet analyticsOrigin="overview_page" />
          </Shortcuts>
        </WorthOverviewPanel>
      </WorthUnlockedWalletPanel>
      <UnlockedWalletPanel bottom>
        <WalletTokensTabsStyled />
      </UnlockedWalletPanel>
    </UnlockedWalletPage>
  )
}

export default styled(OverviewPage)`
  background-color: ${({ theme }) => theme.bg.background1};
`

const WalletTokensTabsStyled = styled(WalletTokensTabs)`
  flex: 2;
`

const Shortcuts = styled.div`
  align-items: center;
  justify-content: center;
  z-index: 1;
`

const WorthUnlockedWalletPanel = styled(UnlockedWalletPanel)`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
`

const WorthOverviewPanel = styled.div`
  border-radius: var(--radius-huge);
  padding: var(--spacing-4);
  overflow: hidden;
  z-index: 1;
`
