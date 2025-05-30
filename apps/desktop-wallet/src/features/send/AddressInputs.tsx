import { AddressHash } from '@alephium/shared'
import { useFetchAddressesHashesSortedByLastUse } from '@alephium/shared-react'
import { AlbumIcon, ContactIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
  const moveFocusOnPreviousModal = useMoveFocusOnPreviousModal()
  const contacts = useAppSelector(selectAllContacts)
  const { data: allAddressHashes } = useFetchAddressesHashesSortedByLastUse()

  const [isContactSelectModalOpen, setIsContactSelectModalOpen] = useState(false)
  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false)

  const contactSelectOptions: SelectOption<AddressHash>[] = contacts.map((contact) => ({
    value: contact.address,
    label: contact.name,
    searchString: `${contact.name.toLowerCase()} ${contact.address.toLowerCase()}`
  }))

  const handleContactSelect = (contactAddress: SelectOption<AddressHash>) =>
    onContactSelect && onContactSelect(contactAddress.value)

  const handleToOwnAddressModalClose = () => {
    setIsAddressSelectModalOpen(false)
    moveFocusOnPreviousModal()
  }

  const handleContactSelectModalClose = () => {
    setIsContactSelectModalOpen(false)
    moveFocusOnPreviousModal()
  }

  const handleAddressSelect = useCallback(
    (address: AddressHash) => onToAddressChange && onToAddressChange(address),
    [onToAddressChange]
  )

  return (
    <InputsContainer>
      <InputsSection title={t('Origin')} className={className}>
        <AddressSelect
          title={t('Select the address to send funds from.')}
          addressOptions={fromAddresses}
          selectedAddress={defaultFromAddress}
          onAddressChange={onFromAddressChange}
          id="from-address"
          shouldDisplayAddressSelectModal={isAddressSelectModalOpen}
          noMargin
        />
      </InputsSection>
      {toAddress && onToAddressChange && (
        <InputsSection title={t('Destination')} className={className}>
          <AddressToInput
            value={toAddress.value}
            error={toAddress.error}
            onChange={(e) => onToAddressChange(e.target.value.trim())}
            placeholder={t('The address which will receive the assets.')}
            heightSize="big"
            noMargin
          />
          <DestinationActions>
            <Button Icon={ContactIcon} role="secondary" short onClick={() => setIsContactSelectModalOpen(true)}>
              {t('Contacts')}
            </Button>
            <Button Icon={AlbumIcon} role="secondary" short onClick={() => setIsAddressSelectModalOpen(true)}>
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
            setValue={handleContactSelect}
            onClose={handleContactSelectModalClose}
            isSearchable
            searchPlaceholder={t('Search for name or a hash...')}
            optionRender={(contact) => (
              <SelectOptionItemContent
                MainContent={<Name>{contact.label}</Name>}
                SecondaryContent={<HashEllipsedStyled hash={contact.value} disableA11y />}
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

const AddressToInput = styled(AddressInput)`
  margin: 0;
`

const DestinationActions = styled.div`
  display: flex;
  gap: 5px;
  margin-top: var(--spacing-2);
`
