import { useTranslation } from 'react-i18next'

import Tabs from '@/components/tabs/Tabs'
import { AddressFTsBalancesList } from '@/features/assetsLists/FTsBalancesList'
import { AddressNFTsGrid } from '@/features/assetsLists/nfts/NFTsGrid'
import { AddressModalBaseProp } from '@/features/modals/modalTypes'
import AddressTransactionsList from '@/features/transactionsDisplay/transactionLists/lists/AddressTransactionsList'

export const AddressDetailsModalTabs = ({ addressHash }: AddressModalBaseProp) => {
  const { t } = useTranslation()

  return (
    <Tabs
      tabs={[
        {
          value: 'fts',
          label: t('Address tokens'),
          renderContent: () => <AddressFTsBalancesList addressHash={addressHash} />
        },
        { value: 'nfts', label: t('Address NFTs'), renderContent: () => <AddressNFTsGrid addressHash={addressHash} /> },
        {
          value: 'activity',
          label: t('Activity'),
          renderContent: () => <AddressTransactionsList addressHash={addressHash} />
        }
      ]}
    />
  )
}
