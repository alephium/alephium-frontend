import { useTranslation } from 'react-i18next'

import Tabs from '@/components/tabs/Tabs'
import { WalletFTsBalancesList } from '@/features/assetsLists/FTsBalancesList'
import { WalletNFTsGrid } from '@/features/assetsLists/nfts/NFTsGrid'

const OverviewTabs = () => {
  const { t } = useTranslation()

  return (
    <Tabs
      tabs={[
        { value: 'fts', label: t('Tokens'), renderContent: () => <WalletFTsBalancesList /> },
        { value: 'nfts', label: t('NFTs'), renderContent: () => <WalletNFTsGrid /> }
      ]}
    />
  )
}

export default OverviewTabs
