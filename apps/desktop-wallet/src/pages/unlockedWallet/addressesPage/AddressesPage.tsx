import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Tabs from '@/components/tabs/Tabs'
import AddressesTabContent from '@/pages/unlockedWallet/addressesPage/AddressesTabContent'
import ContactsTabContent from '@/pages/unlockedWallet/addressesPage/ContactsTabContent'
import { UnlockedWalletPanel } from '@/pages/unlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/unlockedWallet/UnlockedWalletPage'

const AddressesPage = () => {
  const { t } = useTranslation()

  return (
    <UnlockedWalletPage
      title={t('Addresses & contacts')}
      subtitle={t('Easily organize your addresses and your contacts for a more serene transfer experience.')}
    >
      <TabsContent>
        <UnlockedWalletPanel>
          <Tabs
            tabs={[
              { value: 'addresses', label: t('Addresses'), renderContent: () => <AddressesTabContent /> },
              { value: 'contacts', label: t('Contacts'), renderContent: () => <ContactsTabContent /> }
            ]}
          />
        </UnlockedWalletPanel>
      </TabsContent>
    </UnlockedWalletPage>
  )
}

export default AddressesPage

const TabsContent = styled.div`
  padding-bottom: 45px;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-bottom: none;
  flex: 1;
  background-color: ${({ theme }) => theme.bg.background1};
`
