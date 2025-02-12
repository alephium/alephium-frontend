import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
  const { t } = useTranslation()

  return (
    <UnlockedWalletPage className={className}>
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

export default OverviewPage

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
  align-items: flex-start;
`

const WorthOverviewPanel = styled.div`
  border-radius: var(--radius-huge);
  overflow: hidden;
  z-index: 1;
`
