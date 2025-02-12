import { useTranslation } from 'react-i18next'

import { TabItem } from '@/components/tabs/TabBar'
import Tabs from '@/components/tabs/Tabs'
import { WalletFTsBalancesList } from '@/features/assetsLists/FTsBalancesList'
import { WalletNFTsGrid } from '@/features/assetsLists/NFTsGrid'

type WalletTabValue = 'fts' | 'nfts'

const OverviewTabs = ({ className }: { className?: string }) => {
  const { t } = useTranslation()

  const tabs: Array<TabItem<WalletTabValue>> = [
    { value: 'fts', label: t('Address tokens') },
    { value: 'nfts', label: t('Address NFTs') }
  ]

  const renderTab = (tabValue: WalletTabValue) => {
    switch (tabValue) {
      case 'fts':
        return <WalletFTsBalancesList />
      case 'nfts':
        return <WalletNFTsGrid />
    }
  }

  return <Tabs className={className} tabs={tabs} renderTab={renderTab} />
}

export default OverviewTabs
