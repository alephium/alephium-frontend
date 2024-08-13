/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import ShortcutButtons from '@/components/Buttons/ShortcutButtons'
import { TableHeader } from '@/components/Table'
import TransactionList from '@/components/TransactionList'
import AssetsTabs from '@/features/assetsLists/AssetsTabs'
import AddressesList from '@/pages/UnlockedWallet/OverviewPage/AddressesList'
import AmountsOverviewPanel from '@/pages/UnlockedWallet/OverviewPage/AmountsOverviewPanel'
import GreetingMessages from '@/pages/UnlockedWallet/OverviewPage/GreetingMessages'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'

interface OverviewPageProps {
  className?: string
}

const maxPanelHeightInPx = 350

const OverviewPage = ({ className }: OverviewPageProps) => {
  const { t } = useTranslation()

  const [showChart, setShowChart] = useState(false)

  return (
    <UnlockedWalletPage
      className={className}
      onAnimationComplete={() => setShowChart(true)}
      onAnimationStart={() => setShowChart(false)}
    >
      <GreetingMessages />
      <AmountsOverviewPanel showChart={showChart}>
        <Shortcuts>
          <ShortcutsHeader title={t('Shortcuts')} />
          <ButtonsGrid>
            <ShortcutButtons send receive lock walletSettings analyticsOrigin="overview_page" solidBackground />
          </ButtonsGrid>
        </Shortcuts>
      </AmountsOverviewPanel>
      <UnlockedWalletPanel bottom top>
        <AssetAndAddressesRow>
          <AssetsTabsStyled maxHeightInPx={maxPanelHeightInPx} />
          <AddressesListStyled maxHeightInPx={maxPanelHeightInPx} />
        </AssetAndAddressesRow>
        <TransactionList title={t('Latest transactions')} limit={5} />
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

const AssetsTabsStyled = styled(AssetsTabs)`
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
