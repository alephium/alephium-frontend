import { intersection } from 'lodash'
import { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import Select, { SelectOption } from '@/components/Inputs/Select'
import Toggle from '@/components/Inputs/Toggle'
import VerticalDivider from '@/components/PageComponents/VerticalDivider'
import { useFilterAddressesByText } from '@/features/addressFiltering/addressFilteringHooks'
import { openModal } from '@/features/modals/modalActions'
import { addressOrderPreferenceChanged } from '@/features/settings/settingsActions'
import { AddressOrder } from '@/features/settings/settingsConstants'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  useFetchAddressesHashesSortedByAddressesLabelAlphabetical,
  useFetchAddressesHashesWithBalance,
  useFetchAddressesHashesWithBalanceSortedByAlphWorth
} from '@/hooks/useAddresses'
import AddressListRow from '@/pages/UnlockedWallet/AddressesPage/addressListRow/AddressListRow'
import AdvancedOperationsButton from '@/pages/UnlockedWallet/AddressesPage/AdvancedOperationsButton'
import TabContent from '@/pages/UnlockedWallet/AddressesPage/TabContent'

const AddressesTabContent = memo(() => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const [searchInput, setSearchInput] = useState('')
  const [hideEmptyAddresses, setHideEmptyAddresses] = useState(false)
  const filteredByText = useFilterAddressesByText(searchInput.toLowerCase())
  const { data: filteredByToggle } = useFetchAddressesHashesWithBalance()
  const { data: sortedWorthAlph } = useFetchAddressesHashesWithBalanceSortedByAlphWorth()
  const { data: sortedAlphabetical } = useFetchAddressesHashesSortedByAddressesLabelAlphabetical()

  const currentOrder = useAppSelector((state) => state.settings.addressOrderPreference ?? AddressOrder.LastUse)

  const visibleAddresses = useMemo(() => {
    // First get the correctly sorted list
    let addresses
    switch (currentOrder) {
      case AddressOrder.AlphValue:
        addresses = sortedWorthAlph
        break
      case AddressOrder.Alphabetical:
        addresses = sortedAlphabetical
        break
      default:
        addresses = filteredByText
    }

    // Apply text filter
    const textFiltered = searchInput ? intersection(addresses, filteredByText) : addresses

    // Apply empty addresses filter
    return hideEmptyAddresses ? intersection(textFiltered, filteredByToggle) : textFiltered
  }, [
    currentOrder,
    sortedWorthAlph,
    sortedAlphabetical,
    filteredByText,
    filteredByToggle,
    hideEmptyAddresses,
    searchInput
  ])

  const orderOptions: SelectOption<AddressOrder>[] = [
    { value: AddressOrder.LastUse, label: t('Last used') },
    { value: AddressOrder.AlphValue, label: t('ALPH value') },
    { value: AddressOrder.Alphabetical, label: t('Alphabetical') }
  ]

  const onSelect = (value: AddressOrder) => {
    dispatch(addressOrderPreferenceChanged(value))
  }

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
          <SelectWrapper>
            <Select
              id="address-order"
              onSelect={onSelect}
              options={orderOptions}
              controlledValue={orderOptions.find((opt) => opt.value === currentOrder)}
              noMargin
              heightSize="small"
            />
          </SelectWrapper>
          <HideEmptyAddressesToggle>
            <ToggleText>{t('Hide empty')}</ToggleText>
            <VerticalDivider />
            <Toggle onToggle={setHideEmptyAddresses} label={t('Hide empty')} toggled={hideEmptyAddresses} />
          </HideEmptyAddressesToggle>
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

const SelectWrapper = styled.div`
  width: 180px;
`
