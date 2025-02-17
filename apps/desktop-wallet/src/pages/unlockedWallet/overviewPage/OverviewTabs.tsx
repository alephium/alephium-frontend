import { useTranslation } from 'react-i18next'

import Tabs from '@/components/tabs/Tabs'
import { WalletFTsBalancesList } from '@/features/assetsLists/FTsBalancesList'
import { WalletNFTsGrid } from '@/features/assetsLists/NFTsGrid'

const OverviewTabs = () => {
  const { t } = useTranslation()

  return (
    <Tabs
      tabs={[
        { value: 'fts', label: t('Address tokens'), renderContent: () => <WalletFTsBalancesList /> },
        { value: 'nfts', label: t('Address NFTs'), renderContent: () => <WalletNFTsGrid /> }
      ]}
    />
  )
}

export default OverviewTabs
