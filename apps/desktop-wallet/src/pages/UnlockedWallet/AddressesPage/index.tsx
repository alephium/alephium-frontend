/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import TabBar, { TabItem } from '@/components/TabBar'
import i18next from '@/i18n'
import AddressesTabContent from '@/pages/UnlockedWallet/AddressesPage/AddressesTabContent'
import ContactsTabContent from '@/pages/UnlockedWallet/AddressesPage/ContactsTabContent'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'

type AddressesTabValue = 'addresses' | 'contacts'

const tabs: TabItem<AddressesTabValue>[] = [
  { value: 'addresses', label: `📭 ${i18next.t('Addresses')}` },
  { value: 'contacts', label: `🫂 ${i18next.t('Contacts')}` }
]

const AddressesPage = () => {
  const { t } = useTranslation()
  const { state } = useLocation()
  const tabsRowRef = useRef<HTMLDivElement>(null)

  const [currentTab, setCurrentTab] = useState<TabItem<AddressesTabValue>>(
    tabs[state?.activeTab === 'contacts' ? 1 : 0]
  )

  return (
    <UnlockedWalletPage
      title={t('Addresses & contacts')}
      subtitle={t('Easily organize your addresses and your contacts for a more serene transfer experience.')}
      BottomComponent={
        <TabBarPanel ref={tabsRowRef}>
          <TabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
        </TabBarPanel>
      }
    >
      <TabContent>
        <TabPanel>
          <TabAnimation
            animate={{
              opacity: currentTab.value === 'addresses' ? 1 : 0,
              zIndex: currentTab.value === 'addresses' ? 1 : 0
            }}
          >
            <AddressesTabContent />
          </TabAnimation>
          <TabAnimation
            animate={{
              opacity: currentTab.value === 'contacts' ? 1 : 0,
              zIndex: currentTab.value === 'contacts' ? 1 : 0
            }}
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
  padding-top: 30px;
  padding-bottom: 45px;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-bottom: none;
  flex: 1;
  background-color: ${({ theme }) => theme.bg.background1};
  border-top: 1px solid ${({ theme }) => theme.border.primary};
`

const TabPanel = styled(UnlockedWalletPanel)``

const TabAnimation = styled(motion.div)`
  position: relative;
`

const TabBarPanel = styled(TabPanel)`
  z-index: 1;
`
