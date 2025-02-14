import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import AnimatedBackground from '@/components/AnimatedBackground'
import { ShortcutButtonsGroupWallet } from '@/components/Buttons/ShortcutButtons'
import LabeledWorthOverview from '@/components/LabeledWorthOverview'
import { WalletTokensTabs } from '@/features/assetsLists/AddressDetailsTabs'
import { useAppSelector } from '@/hooks/redux'
import WalletWorth from '@/pages/unlockedWallet/overviewPage/WalletWorth'
import { UnlockedWalletPanel } from '@/pages/unlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/unlockedWallet/UnlockedWalletPage'
import { useDisplayColor, useHashToColor } from '@/utils/colors'
interface OverviewPageProps {
  className?: string
}

const OverviewPage = ({ className }: OverviewPageProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const activeWalletHash = useAppSelector((s) => s.activeWallet.id)
  const walletColor = useDisplayColor(useHashToColor(activeWalletHash), true)

  return (
    <UnlockedWalletPage className={className}>
      <AnimatedBackground
        anchorPosition="top"
        opacity={theme.name === 'dark' ? 0.4 : 0.5}
        verticalOffset={-100}
        horizontalOffset={-250}
        shade={walletColor}
      />
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
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-huge);
  overflow: hidden;
  z-index: 1;
  gap: 30px;
`
