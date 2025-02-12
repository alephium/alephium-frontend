import { useTranslation } from 'react-i18next'

import { TabItem } from '@/components/tabs/TabBar'
import Tabs from '@/components/tabs/Tabs'
import { TokenDetailsModalProps } from '@/modals/tokenDetails/tokeDetailsTypes'
import TokenAddressesList from '@/modals/tokenDetails/TokenAddressList'
import WalletTokenTransactionsList from '@/modals/tokenDetails/WalletTokenTransactionsList'

type AddressTabValue = 'activity' | 'addresses'

export const TokenDetailsModalTabs = ({ tokenId }: TokenDetailsModalProps) => {
  const { t } = useTranslation()

  const tabs: Array<TabItem<AddressTabValue>> = [
    { value: 'activity', label: t('Activity') },
    { value: 'addresses', label: t('Addresses') }
  ]

  const renderTab = (tabValue: AddressTabValue) => {
    switch (tabValue) {
      case 'activity':
        return <WalletTokenTransactionsList tokenId={tokenId} />
      case 'addresses':
        return <TokenAddressesList tokenId={tokenId} />
    }
  }

  return <Tabs tabs={tabs} renderTab={renderTab} />
}
