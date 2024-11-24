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

import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

import useFetchAddressTokensByType from '@/api/apiDataHooks/address/useFetchAddressTokensByType'
import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
import FocusableContent from '@/components/FocusableContent'
import { TabItem } from '@/components/TabBar'
import Table, { ExpandableTable } from '@/components/Table'
import TableTabBar from '@/components/TableTabBar'
import { AddressFTsBalancesList, WalletFTsBalancesList } from '@/features/assetsLists/FTsBalancesList'
import { AddressNFTsGrid, WalletNFTsGrid } from '@/features/assetsLists/NFTsGrid'
import { AddressNSTsBalancesList, WalletNSTsBalancesList } from '@/features/assetsLists/NSTsBalancesList'
import { AddressTokensTabsProps, TokensTabValue, WalletTokensTabsProps } from '@/features/assetsLists/types'
import useTokensTabs from '@/features/assetsLists/useTokensTabs'

export const AddressTokensTabs = ({ addressHash }: AddressTokensTabsProps) => {
  const { t } = useTranslation()
  const {
    data: { nstIds }
  } = useFetchAddressTokensByType({ addressHash, includeAlph: false })

  const { tabs, isExpanded, toggleExpansion } = useTokensTabs({
    numberOfNSTs: nstIds.length,
    ftsTabTitle: `💰 ${t('Address tokens')}`,
    nstsTabTitle: `❔ ${t('Address unknown tokens')}`,
    nftsTabTitle: `🖼️ ${t('Address NFTs')}`
  })

  const [currentTab, setCurrentTab] = useState<TabItem<TokensTabValue>>(tabs[0])

  const props = { addressHash, isExpanded, onExpand: toggleExpansion }

  const renderTab = (tabValue: TokensTabValue) => {
    switch (tabValue) {
      case 'fts':
        return <AddressFTsBalancesList {...props} />
      case 'nfts':
        return <AddressNFTsGrid {...props} />
      case 'nsts':
        return <AddressNSTsBalancesList {...props} />
    }
  }

  return (
    <TokensTabs tabs={tabs} currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderTab(currentTab.value)}
    </TokensTabs>
  )
}

export const WalletTokensTabs = ({ maxHeightInPx, className }: WalletTokensTabsProps) => {
  const { t } = useTranslation()
  const {
    data: { nstIds }
  } = useFetchWalletTokensByType({ includeAlph: false })

  const { tabs, isExpanded, toggleExpansion } = useTokensTabs({
    numberOfNSTs: nstIds.length,
    ftsTabTitle: `💰 ${t('Tokens')}`,
    nstsTabTitle: `❔ ${t('Unknown tokens')}`,
    nftsTabTitle: `🖼️ ${t('NFTs')}`
  })

  const [currentTab, setCurrentTab] = useState<TabItem<TokensTabValue>>(tabs[0])

  const props = { isExpanded: isExpanded || !maxHeightInPx, onExpand: toggleExpansion }

  const renderTab = (tabValue: TokensTabValue) => {
    switch (tabValue) {
      case 'fts':
        return <WalletFTsBalancesList {...props} />
      case 'nfts':
        return <WalletNFTsGrid {...props} />
      case 'nsts':
        return <WalletNSTsBalancesList {...props} />
    }
  }

  return (
    <TokensTabs
      className={className}
      tabs={tabs}
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      isExpanded={isExpanded}
      toggleExpansion={toggleExpansion}
      maxHeightInPx={maxHeightInPx}
    >
      {renderTab(currentTab.value)}
    </TokensTabs>
  )
}

interface TokensTabsProps {
  tabs: TabItem<TokensTabValue>[]
  children: ReactNode
  currentTab: TabItem<TokensTabValue>
  setCurrentTab: (tab: TabItem<TokensTabValue>) => void
  isExpanded?: boolean
  toggleExpansion?: () => void
  className?: string
  maxHeightInPx?: number
}

const TokensTabs = ({
  tabs,
  currentTab,
  setCurrentTab,
  isExpanded,
  toggleExpansion,
  maxHeightInPx,
  className,
  children
}: TokensTabsProps) =>
  isExpanded !== undefined && toggleExpansion ? (
    <FocusableContent className={className} isFocused={isExpanded} onClose={toggleExpansion}>
      <ExpandableTable isExpanded={isExpanded} maxHeightInPx={maxHeightInPx}>
        <TableTabBar items={tabs} onTabChange={setCurrentTab} activeTab={currentTab} />
        {children}
      </ExpandableTable>
    </FocusableContent>
  ) : (
    <Table className={className}>
      <TableTabBar items={tabs} onTabChange={setCurrentTab} activeTab={currentTab} />

      {children}
    </Table>
  )
