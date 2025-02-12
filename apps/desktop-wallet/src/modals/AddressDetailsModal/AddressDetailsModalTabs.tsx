import { useTranslation } from 'react-i18next'

import { TabItem } from '@/components/tabs/TabBar'
import Tabs from '@/components/tabs/Tabs'
import { AddressFTsBalancesList } from '@/features/assetsLists/FTsBalancesList'
import { AddressNFTsGrid } from '@/features/assetsLists/NFTsGrid'
import { AddressModalBaseProp } from '@/features/modals/modalTypes'
import AddressTransactionsList from '@/features/transactionsDisplay/transactionLists/lists/AddressTransactionsList'

type AddressTabValue = 'fts' | 'nfts' | 'activity'

export const AddressDetailsModalTabs = ({ addressHash }: AddressModalBaseProp) => {
  const { t } = useTranslation()

  const tabs: Array<TabItem<AddressTabValue>> = [
    { value: 'fts', label: t('Address tokens') },
    { value: 'nfts', label: t('Address NFTs') },
    { value: 'activity', label: t('Activity') }
  ]

  const renderTab = (tabValue: AddressTabValue) => {
    switch (tabValue) {
      case 'fts':
        return <AddressFTsBalancesList addressHash={addressHash} />
      case 'nfts':
        return <AddressNFTsGrid addressHash={addressHash} />
      case 'activity':
        return <AddressTransactionsList addressHash={addressHash} />
    }
  }

  return <Tabs tabs={tabs} renderTab={renderTab} />
}
