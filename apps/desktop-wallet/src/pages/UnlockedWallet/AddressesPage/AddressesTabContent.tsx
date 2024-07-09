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

import { Wrench } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAddressesWithSomeBalance } from '@/api/apiHooks'
import Box from '@/components/Box'
import Button from '@/components/Button'
import Toggle from '@/components/Inputs/Toggle'
import VerticalDivider from '@/components/PageComponents/VerticalDivider'
import { useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import NewAddressModal from '@/modals/NewAddressModal'
import AddressGridRow from '@/pages/UnlockedWallet/AddressesPage/AddressGridRow'
import AdvancedOperationsSideModal from '@/pages/UnlockedWallet/AddressesPage/AdvancedOperationsSideModal'
import TabContent from '@/pages/UnlockedWallet/AddressesPage/TabContent'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { useFilteredAddresses } from '@/utils/addresses'

interface AddressesTabContentProps {
  tabsRowHeight: number
}

const AddressesTabContent = ({ tabsRowHeight }: AddressesTabContentProps) => {
  const { t } = useTranslation()
  const allAddresses = useAppSelector(selectAllAddresses)
  const { data: addressesWithSomeBalance } = useAddressesWithSomeBalance()

  const [isGenerateNewAddressModalOpen, setIsGenerateNewAddressModalOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [hideEmptyAddresses, setHideEmptyAddresses] = useState(false)
  const [isAdvancedOperationsModalOpen, setIsAdvancedOperationsModalOpen] = useState(false)

  let filteredAddresses = useFilteredAddresses(allAddresses, searchInput.toLowerCase())

  filteredAddresses = hideEmptyAddresses
    ? filteredAddresses.filter((address) => addressesWithSomeBalance.find((a) => address.hash === a.hash))
    : filteredAddresses

  return (
    <TabContent
      searchPlaceholder={t('Search for label, a hash or an asset...')}
      onSearch={setSearchInput}
      buttonText={`+ ${t('New address')}`}
      onButtonClick={() => setIsGenerateNewAddressModalOpen(true)}
      HeaderMiddleComponent={
        <HeaderMiddle>
          <HideEmptyAddressesToggle>
            <ToggleText>{t('Hide empty')}</ToggleText>
            <VerticalDivider />
            <Toggle onToggle={setHideEmptyAddresses} label={t('Hide empty')} toggled={hideEmptyAddresses} />
          </HideEmptyAddressesToggle>
          <Button
            role="secondary"
            squared
            Icon={Wrench}
            onClick={() => setIsAdvancedOperationsModalOpen(true)}
            data-tooltip-id="default"
            data-tooltip-content={t('Advanced operations')}
          />
        </HeaderMiddle>
      }
    >
      <TableGrid>
        <TableGridContent>
          {filteredAddresses.map((address) => (
            <AddressGridRow addressHash={address.hash} key={address.hash} />
          ))}
        </TableGridContent>
      </TableGrid>

      <ModalPortal>
        {isAdvancedOperationsModalOpen && (
          <AdvancedOperationsSideModal onClose={() => setIsAdvancedOperationsModalOpen(false)} />
        )}
        {isGenerateNewAddressModalOpen && (
          <NewAddressModal
            singleAddress
            title={t('New address')}
            onClose={() => setIsGenerateNewAddressModalOpen(false)}
          />
        )}
      </ModalPortal>
    </TabContent>
  )
}

export default AddressesTabContent

const HideEmptyAddressesToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  height: 50px;
  padding: 12px 16px;
  border-radius: var(--radius-big);
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.tertiary};
`

const ToggleText = styled.div`
  font-weight: var(--fontWeight-medium);
  color: ${({ theme }) => theme.font.secondary};
`

const HeaderMiddle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex: 1;
`

const TableGrid = styled(Box)`
  contain: paint; // This is amazing. It replaces "overflow: hidden". Using "overflow" on this prevents us from having a sticky table header.
  display: flex;
  flex-direction: column;
`

const TableGridContent = styled.div`
  background-color: ${({ theme }) => theme.border.secondary};
  display: flex;
  flex-direction: column;
`
