import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AmountsOverviewPanel from '@/components/AmountsOverviewPanel'
import Box from '@/components/Box'
import { ShortcutButtonsGroupWallet } from '@/components/Buttons/ShortcutButtons'
import { TableHeader } from '@/components/Table'
import { WalletTokensTabs } from '@/features/assetsLists/TokensTabs'
import WalletLatestTransactionsList from '@/features/transactionsDisplay/transactionLists/lists/WalletLatestTransactionsList'
import AddressesList from '@/pages/UnlockedWallet/OverviewPage/AddressesList'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'

interface OverviewPageProps {
  className?: string
}

const maxPanelHeightInPx = 350

let wasChartAnimatedOnce = false

const OverviewPage = ({ className }: OverviewPageProps) => {
  const { t } = useTranslation()

  const [chartVisible, setIsChartVisible] = useState(wasChartAnimatedOnce)

  const handleAnimationComplete = () => {
    setIsChartVisible(true)
    wasChartAnimatedOnce = true
  }

  return (
    <UnlockedWalletPage className={className} onAnimationComplete={() => handleAnimationComplete()}>
      <AmountsOverviewPanel chartVisible={chartVisible} chartInitiallyHidden={!chartVisible}>
        <Shortcuts>
          <ShortcutsHeader title={t('Shortcuts')} />
          <ButtonsGrid>
            <ShortcutButtonsGroupWallet lock settings analyticsOrigin="overview_page" solidBackground />
          </ButtonsGrid>
        </Shortcuts>
      </AmountsOverviewPanel>
      <UnlockedWalletPanel bottom top>
        <AssetAndAddressesRow>
          <WalletTokensTabsStyled maxHeightInPx={maxPanelHeightInPx} />
          <AddressesListStyled maxHeightInPx={maxPanelHeightInPx} />
        </AssetAndAddressesRow>
        <WalletLatestTransactionsList />
      </UnlockedWalletPanel>
    </UnlockedWalletPage>
  )
}

export default styled(OverviewPage)`
  background-color: ${({ theme }) => theme.bg.background1};
`

const AssetAndAddressesRow = styled.div`
  display: flex;
  gap: 30px;
`

const WalletTokensTabsStyled = styled(WalletTokensTabs)`
  flex: 2;
  margin-bottom: 45px;
`

const AddressesListStyled = styled(AddressesList)`
  flex: 1;
`

const Shortcuts = styled(Box)`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
  background-color: ${({ theme }) => theme.bg.secondary};
`

const ShortcutsHeader = styled(TableHeader)`
  max-height: 45px !important;
  min-height: auto;
`

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background-color: ${({ theme }) => theme.border.secondary};

  > button {
    justify-content: flex-start;
    padding: 0 20px;
  }
`
