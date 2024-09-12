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

import { useAddressesUnlistedNonStandardTokenIds } from '@/api/addressesUnlistedTokensHooks'
import useAddressNSTs from '@/api/apiDataHooks/useAddressNSTs'
import FocusableContent from '@/components/FocusableContent'
import { TabItem } from '@/components/TabBar'
import { ExpandableTable } from '@/components/Table'
import TableTabBar from '@/components/TableTabBar'
import FungibleTokensBalancesList from '@/features/assetsLists/FungibleTokensBalancesList'
import NFTsGrid from '@/features/assetsLists/NFTsGrid'
import NonStandardTokensBalancesList from '@/features/assetsLists/NonStandardTokensBalancesList'
import { AddressTokensTabsProps, TokensTabValue, WalletTokensTabsProps } from '@/features/assetsLists/types'
import useTokensTabs from '@/features/assetsLists/useTokensTabs'

export const AddressTokensTabs = ({ addressHash, maxHeightInPx, nftColumns }: AddressTokensTabsProps) => {
  const { t } = useTranslation()
  const { data: nstIds } = useAddressNSTs(addressHash)

  const { tabs, isExpanded, toggleExpansion } = useTokensTabs({
    numberOfNSTs: nstIds.length,
    ftsTabTitle: `💰 ${t('Address tokens')}`,
    nstsTabTitle: `❔ ${t('Address unknown tokens')}`,
    nftsTabTitle: `🖼️ ${t('Address NFTs')}`
  })

  const [currentTab, setCurrentTab] = useState<TabItem<TokensTabValue>>(tabs[0])

  const _isExpanded = isExpanded || !maxHeightInPx

  const renderTab = (tabValue: TokensTabValue) => {
    switch (tabValue) {
      case 'fts':
        return (
          <FungibleTokensBalancesList addressHash={addressHash} isExpanded={_isExpanded} onExpand={toggleExpansion} />
        )
      case 'nfts':
        return (
          <NFTsGrid
            addressHash={addressHash}
            isExpanded={_isExpanded}
            onExpand={toggleExpansion}
            nftColumns={nftColumns}
          />
        )
      case 'nsts':
        return (
          <NonStandardTokensBalancesList
            addressHash={addressHash}
            isExpanded={_isExpanded}
            onExpand={toggleExpansion}
          />
        )
    }
  }

  return (
    <TokensTabs
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

export const WalletTokensTabs = ({ maxHeightInPx, nftColumns }: WalletTokensTabsProps) => {
  const { t } = useTranslation()
  const { data: addressesNSTIds } = useAddressesUnlistedNonStandardTokenIds()

  const { tabs, isExpanded, toggleExpansion } = useTokensTabs({
    numberOfNSTs: addressesNSTIds.length,
    ftsTabTitle: `💰 ${t('Tokens')}`,
    nstsTabTitle: `❔ ${t('Unknown tokens')}`,
    nftsTabTitle: `🖼️ ${t('NFTs')}`
  })

  const [currentTab, setCurrentTab] = useState<TabItem<TokensTabValue>>(tabs[0])

  const _isExpanded = isExpanded || !maxHeightInPx

  const renderTab = (tabValue: TokensTabValue) => {
    switch (tabValue) {
      case 'fts':
        return <FungibleTokensBalancesList isExpanded={_isExpanded} onExpand={toggleExpansion} />
      case 'nfts':
        return <NFTsGrid isExpanded={_isExpanded} onExpand={toggleExpansion} nftColumns={nftColumns} />
      case 'nsts':
        return <NonStandardTokensBalancesList isExpanded={_isExpanded} onExpand={toggleExpansion} />
    }
  }

  return (
    <TokensTabs
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
  isExpanded: boolean
  toggleExpansion: () => void
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
}: TokensTabsProps) => (
  <FocusableContent className={className} isFocused={isExpanded} onClose={toggleExpansion}>
    <ExpandableTable isExpanded={isExpanded} maxHeightInPx={maxHeightInPx}>
      <TableTabBar items={tabs} onTabChange={setCurrentTab} activeTab={currentTab} />

      {children}
    </ExpandableTable>
  </FocusableContent>
)
