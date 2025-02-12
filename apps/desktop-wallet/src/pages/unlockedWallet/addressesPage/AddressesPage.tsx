import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { fastTransition } from '@/animations'
import TabBar, { TabItem } from '@/components/TabBar'
import i18next from '@/features/localization/i18n'
import AddressesTabContent from '@/pages/unlockedWallet/addressesPage/AddressesTabContent'
import ContactsTabContent from '@/pages/unlockedWallet/addressesPage/ContactsTabContent'
import { UnlockedWalletPanel } from '@/pages/unlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/unlockedWallet/UnlockedWalletPage'

type AddressesTabValue = 'addresses' | 'contacts'

const tabs: TabItem<AddressesTabValue>[] = [
  { value: 'addresses', label: i18next.t('Addresses') },
  { value: 'contacts', label: i18next.t('Contacts') }
]

const AddressesPage = () => {
  const { t } = useTranslation()
  const { state } = useLocation()

  const [currentTab, setCurrentTab] = useState<TabItem<AddressesTabValue>>(
    tabs[state?.activeTab === 'contacts' ? 1 : 0]
  )

  return (
    <UnlockedWalletPage
      title={t('Addresses & contacts')}
      subtitle={t('Easily organize your addresses and your contacts for a more serene transfer experience.')}
      BottomComponent={
        <TabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} justifyTabs="left" />
      }
    >
      <TabContent>
        <TabPanel>
          <TabAnimation
            animate={{
              opacity: currentTab.value === 'addresses' ? 1 : 0,
              zIndex: currentTab.value === 'addresses' ? 1 : 0
            }}
            {...fastTransition}
          >
            <AddressesTabContent />
          </TabAnimation>
          <TabAnimation
            animate={{
              opacity: currentTab.value === 'contacts' ? 1 : 0,
              zIndex: currentTab.value === 'contacts' ? 1 : 0
            }}
            {...fastTransition}
          >
            <ContactsTabContent />
          </TabAnimation>
        </TabPanel>
      </TabContent>
    </UnlockedWalletPage>
  )
}

export default AddressesPage

const TabContent = styled.div`
  padding-top: 10px;
`

const TabPanel = styled(UnlockedWalletPanel)``

const TabAnimation = styled(motion.div)`
  position: relative;
`
