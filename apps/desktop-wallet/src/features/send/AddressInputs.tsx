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

import { AddressHash } from '@alephium/shared'
import { AlbumIcon, ContactIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useFetchWalletAddressesSortedByActivity from '@/api/apiDataHooks/wallet/useFetchWalletAddressesSortedByActivity'
import Box from '@/components/Box'
import Button from '@/components/Button'
import HashEllipsed from '@/components/HashEllipsed'
import AddressInput from '@/components/Inputs/AddressInput'
import AddressSelect from '@/components/Inputs/AddressSelect'
import { SelectOption, SelectOptionsModal } from '@/components/Inputs/Select'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import Truncate from '@/components/Truncate'
import InputsSection from '@/features/send/InputsSection'
import { useAppSelector } from '@/hooks/redux'
import AddressSelectModal from '@/modals/AddressSelectModal'
import { useMoveFocusOnPreviousModal } from '@/modals/ModalContainer'
import ModalPortal from '@/modals/ModalPortal'
import { selectAllContacts } from '@/storage/addresses/addressesSelectors'
import { filterContacts } from '@/utils/contacts'

interface AddressInputsProps {
  defaultFromAddress: AddressHash
  toAddress?: { value: string; error: string }
  fromAddresses: AddressHash[]
  onFromAddressChange: (address: AddressHash) => void
  onToAddressChange?: (address: string) => void
  onContactSelect?: (address: string) => void
  className?: string
}

const AddressInputs = ({
  defaultFromAddress,
  fromAddresses,
  toAddress,
  onFromAddressChange,
  onToAddressChange,
  onContactSelect,
  className
}: AddressInputsProps) => {
  const { t } = useTranslation()
  const updatedInitialAddress = fromAddresses.find((a) => a === defaultFromAddress) ?? fromAddresses[0]
  const moveFocusOnPreviousModal = useMoveFocusOnPreviousModal()
  const contacts = useAppSelector(selectAllContacts)
  const { data: allAddressHashes } = useFetchWalletAddressesSortedByActivity()
  const theme = useTheme()

  const [isContactSelectModalOpen, setIsContactSelectModalOpen] = useState(false)
  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false)
  const [filteredContacts, setFilteredContacts] = useState(contacts)

  const contactSelectOptions: SelectOption<AddressHash>[] = contacts.map((contact) => ({
    value: contact.address,
    label: contact.name
  }))

  const handleContactSelect = (contactAddress: SelectOption<AddressHash>) =>
    onContactSelect && onContactSelect(contactAddress.value)

  const handleContactsSearch = (searchInput: string) =>
    setFilteredContacts(filterContacts(contacts, searchInput.toLowerCase()))

  const handleToOwnAddressModalClose = () => {
    setIsAddressSelectModalOpen(false)
    moveFocusOnPreviousModal()
  }

  const handleContactSelectModalClose = () => {
    setIsContactSelectModalOpen(false)
    setFilteredContacts(contacts)
    moveFocusOnPreviousModal()
  }

  const handleAddressSelect = useCallback(
    (address: AddressHash) => onToAddressChange && onToAddressChange(address),
    [onToAddressChange]
  )

  return (
    <InputsContainer>
      <InputsSection
        title={t('Origin')}
        subtitle={t('One of your addresses to send the assets from.')}
        className={className}
      >
        <BoxStyled>
          <AddressSelect
            title={t('Select the address to send funds from.')}
            addressOptions={fromAddresses}
            defaultAddress={updatedInitialAddress}
            onAddressChange={onFromAddressChange}
            id="from-address"
            simpleMode
            shouldDisplayAddressSelectModal={isAddressSelectModalOpen}
          />
        </BoxStyled>
      </InputsSection>
      {toAddress && onToAddressChange && (
        <InputsSection
          title={t('Destination')}
          subtitle={t('The address which will receive the assets.')}
          className={className}
        >
          <AddressToInput
            value={toAddress.value}
            error={toAddress.error}
            onChange={(e) => onToAddressChange(e.target.value.trim())}
          />
          <DestinationActions>
            <Button
              Icon={ContactIcon}
              iconColor={theme.global.accent}
              variant="faded"
              short
              borderless
              onClick={() => setIsContactSelectModalOpen(true)}
            >
              {t('Contacts')}
            </Button>
            <Button
              Icon={AlbumIcon}
              iconColor={theme.global.accent}
              variant="faded"
              short
              borderless
              onClick={() => setIsAddressSelectModalOpen(true)}
            >
              {t('Your addresses')}
            </Button>
          </DestinationActions>
        </InputsSection>
      )}

      <ModalPortal>
        {isContactSelectModalOpen && (
          <SelectOptionsModal
            title={t('Choose a contact')}
            options={contactSelectOptions}
            showOnly={filteredContacts.map((contact) => contact.address)}
            setValue={handleContactSelect}
            onClose={handleContactSelectModalClose}
            onSearchInput={handleContactsSearch}
            searchPlaceholder={t('Search for name or a hash...')}
            optionRender={(contact) => (
              <SelectOptionItemContent
                MainContent={<Name>{contact.label}</Name>}
                SecondaryContent={<HashEllipsedStyled hash={contact.value} disableA11y />}
                isSelected={contact.value === toAddress?.value}
              />
            )}
          />
        )}
        {isAddressSelectModalOpen && onToAddressChange && (
          <AddressSelectModal
            title={t('Select the address to send assets to.')}
            addressOptions={allAddressHashes}
            onAddressSelect={handleAddressSelect}
            onClose={handleToOwnAddressModalClose}
            defaultSelectedAddress={fromAddresses.find((a) => a === toAddress?.value)}
          />
        )}
      </ModalPortal>
    </InputsContainer>
  )
}

export default AddressInputs

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`

const Name = styled(Truncate)`
  font-weight: var(--fontWeight-semiBold);
  max-width: 200px;
`

const HashEllipsedStyled = styled(HashEllipsed)`
  margin-left: auto;
  color: ${({ theme }) => theme.font.secondary};
  max-width: 150px;
`

const BoxStyled = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--inputHeight);
`

const AddressToInput = styled(AddressInput)`
  margin: 0;
`

const DestinationActions = styled.div`
  display: flex;
  gap: 5px;
`
