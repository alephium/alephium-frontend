import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

import useFetchAddressTokensByType from '@/api/apiDataHooks/address/useFetchAddressTokensByType'
import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
import { TabItem } from '@/components/TabBar'
import Table from '@/components/Table'
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

  const { tabs: tokenTabs } = useTokensTabs({
    numberOfNSTs: nstIds.length,
    ftsTabTitle: t('Address tokens'),
    nftsTabTitle: t('Address NFTs'),
    nstsTabTitle: t('Address unknown tokens')
  })

  const tabs = [...tokenTabs, { value: 'activity' as TokensAndActivityTabValue, label: t('Activity') }]

  const [currentTab, setCurrentTab] = useState<TabItem<TokensAndActivityTabValue>>(tabs[0])

  const props = { addressHash }

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

export const WalletTokensTabs = ({ className }: WalletTokensTabsProps) => {
  const { t } = useTranslation()
  const {
    data: { nstIds }
  } = useFetchWalletTokensByType({ includeAlph: false })

  const { tabs } = useTokensTabs({
    numberOfNSTs: nstIds.length,
    ftsTabTitle: t('Tokens'),
    nstsTabTitle: t('Unknown tokens'),
    nftsTabTitle: t('NFTs')
  })

  const [currentTab, setCurrentTab] = useState<TabItem<TokensTabValue>>(tabs[0])

  const renderTab = (tabValue: TokensTabValue) => {
    switch (tabValue) {
      case 'fts':
        return <WalletFTsBalancesList />
      case 'nfts':
        return <WalletNFTsGrid />
      case 'nsts':
        return <WalletNSTsBalancesList />
    }
  }

  return (
    <Tabs className={className} tabs={tabs} currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderTab(currentTab.value)}
    </Tabs>
  )
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[]
  children: ReactNode
  currentTab: TabItem<T>
  setCurrentTab: (tab: TabItem<T>) => void
  className?: string
}

const Tabs = <T extends string>({ tabs, currentTab, setCurrentTab, className, children }: TabsProps<T>) => (
  <Table className={className}>
    <TableTabBar items={tabs} onTabChange={setCurrentTab} activeTab={currentTab} />
    {children}
  </Table>
)
