import { intersection } from 'lodash'
import { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import Toggle from '@/components/Inputs/Toggle'
import VerticalDivider from '@/components/PageComponents/VerticalDivider'
import { useFilterAddressesByText } from '@/features/addressFiltering/addressFilteringHooks'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'
import { useFetchAddressesHashesSortedByPreference, useFetchAddressesHashesWithBalance } from '@/hooks/useAddresses'
import AddressListRow from '@/pages/UnlockedWallet/AddressesPage/addressListRow/AddressListRow'
import AddressSortingSelect from '@/pages/UnlockedWallet/AddressesPage/AddressSortingSelect'
import AdvancedOperationsButton from '@/pages/UnlockedWallet/AddressesPage/AdvancedOperationsButton'
import TabContent from '@/pages/UnlockedWallet/AddressesPage/TabContent'

const AddressesTabContent = memo(() => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const [searchInput, setSearchInput] = useState('')
  const [hideEmptyAddresses, setHideEmptyAddresses] = useState(false)

  const unsortedAddressesFilteredByText = useFilterAddressesByText(searchInput.toLowerCase())
  const { data: sortedAddresses } = useFetchAddressesHashesSortedByPreference()
  const { data: addressesWithBalance } = useFetchAddressesHashesWithBalance()

  const visibleAddresses = useMemo(() => {
    // Apply text filter
    const textFiltered = searchInput ? intersection(sortedAddresses, unsortedAddressesFilteredByText) : sortedAddresses

    // Apply empty addresses filter
    return hideEmptyAddresses ? intersection(textFiltered, addressesWithBalance) : textFiltered
  }, [addressesWithBalance, hideEmptyAddresses, searchInput, sortedAddresses, unsortedAddressesFilteredByText])

  const openNewAddressModal = () =>
    dispatch(openModal({ name: 'NewAddressModal', props: { title: t('New address'), singleAddress: true } }))

  return (
    <TabContent
      searchPlaceholder={t('Search for label, a hash or an asset...')}
      onSearch={setSearchInput}
      buttonText={`+ ${t('New address')}`}
      onButtonClick={openNewAddressModal}
      HeaderMiddleComponent={
        <HeaderMiddle>
          <SortingAndFiltering>
            <AddressSortingSelect />
            <HideEmptyAddressesToggle>
              <ToggleText>{t('Hide empty')}</ToggleText>
              <VerticalDivider />
              <Toggle onToggle={setHideEmptyAddresses} label={t('Hide empty')} toggled={hideEmptyAddresses} />
            </HideEmptyAddressesToggle>
          </SortingAndFiltering>
          <AdvancedOperationsButton />
        </HeaderMiddle>
      }
    >
      <TableGrid>
        <TableGridContent>
          {visibleAddresses?.map((addressHash) => <AddressListRow addressHash={addressHash} key={addressHash} />)}
          <Placeholder>{t('No addresses match the search criteria.')}</Placeholder>
        </TableGridContent>
      </TableGrid>
    </TabContent>
  )
})

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

const Placeholder = styled.div`
  display: none;
  padding: 20px;
`

const TableGridContent = styled.div`
  background-color: ${({ theme }) => theme.border.secondary};
  display: flex;
  flex-direction: column;

  > :only-child {
    display: block;
  }
`

const SortingAndFiltering = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`
