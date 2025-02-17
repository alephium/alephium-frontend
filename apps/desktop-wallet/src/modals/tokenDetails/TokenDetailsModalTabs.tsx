import { useTranslation } from 'react-i18next'

import Tabs from '@/components/tabs/Tabs'
import { TokenDetailsModalProps } from '@/modals/tokenDetails/tokeDetailsTypes'
import TokenAddressesList from '@/modals/tokenDetails/TokenAddressList'
import WalletTokenTransactionsList from '@/modals/tokenDetails/WalletTokenTransactionsList'

export const TokenDetailsModalTabs = ({ tokenId }: TokenDetailsModalProps) => {
  const { t } = useTranslation()

  return (
    <Tabs
      tabs={[
        {
          value: 'activity',
          label: t('Activity'),
          renderContent: () => <WalletTokenTransactionsList tokenId={tokenId} />
        },
        { value: 'addresses', label: t('Addresses'), renderContent: () => <TokenAddressesList tokenId={tokenId} /> }
      ]}
    />
  )
}
