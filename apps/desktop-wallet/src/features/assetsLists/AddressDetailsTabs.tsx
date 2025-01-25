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
import {
  AddressDetailsTabsProps,
  TokensAndActivityTabValue,
  TokensTabValue,
  WalletTokensTabsProps
} from '@/features/assetsLists/types'
import useTokensTabs from '@/features/assetsLists/useTokensTabs'
import AddressTransactionsList from '@/features/transactionsDisplay/transactionLists/lists/AddressTransactionsList'

export const AddressDetailsTabs = ({ addressHash }: AddressDetailsTabsProps) => {
  const { t } = useTranslation()
  const {
    data: { nstIds }
  } = useFetchAddressTokensByType({ addressHash, includeAlph: false })

  const {
    tabs: tokenTabs,
    isExpanded,
    toggleExpansion
  } = useTokensTabs({
    numberOfNSTs: nstIds.length,
    ftsTabTitle: t('Address tokens'),
    nftsTabTitle: t('Address NFTs'),
    nstsTabTitle: t('Address unknown tokens')
  })

  const tabs = [...tokenTabs, { value: 'activity' as TokensAndActivityTabValue, label: t('Activity') }]

  const [currentTab, setCurrentTab] = useState<TabItem<TokensAndActivityTabValue>>(tabs[0])

  const props = { addressHash, isExpanded, onExpand: toggleExpansion }

  const renderTab = <T extends string>(tabValue: T) => {
    switch (tabValue) {
      case 'fts':
        return <AddressFTsBalancesList {...props} />
      case 'nfts':
        return <AddressNFTsGrid {...props} />
      case 'nsts':
        return <AddressNSTsBalancesList {...props} />
      case 'activity':
        return <AddressTransactionsList addressHash={addressHash} />
    }
  }

  return (
    <Tabs tabs={tabs} currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderTab(currentTab.value)}
    </Tabs>
  )
}

export const WalletTokensTabs = ({ maxHeightInPx, className }: WalletTokensTabsProps) => {
  const { t } = useTranslation()
  const {
    data: { nstIds }
  } = useFetchWalletTokensByType({ includeAlph: false })

  const { tabs, isExpanded, toggleExpansion } = useTokensTabs({
    numberOfNSTs: nstIds.length,
    ftsTabTitle: t('Tokens'),
    nstsTabTitle: t('Unknown tokens'),
    nftsTabTitle: t('NFTs')
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
    <Tabs
      className={className}
      tabs={tabs}
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      isExpanded={isExpanded}
      toggleExpansion={toggleExpansion}
      maxHeightInPx={maxHeightInPx}
    >
      {renderTab(currentTab.value)}
    </Tabs>
  )
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[]
  children: ReactNode
  currentTab: TabItem<T>
  setCurrentTab: (tab: TabItem<T>) => void
  isExpanded?: boolean
  toggleExpansion?: () => void
  className?: string
  maxHeightInPx?: number
}

const Tabs = <T extends string>({
  tabs,
  currentTab,
  setCurrentTab,
  isExpanded,
  toggleExpansion,
  maxHeightInPx,
  className,
  children
}: TabsProps<T>) =>
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
