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

import { AddressHash, CURRENCIES } from '@alephium/shared'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import { useAddressesWithSomeBalance, useAddressesWorth } from '@/api/apiHooks'
import ActionLink from '@/components/ActionLink'
import AddressRow from '@/components/AddressRow'
import Amount from '@/components/Amount'
import FocusableContent from '@/components/FocusableContent'
import { ExpandableTable, ExpandRow, TableHeader } from '@/components/Table'
import TableCellAmount from '@/components/TableCellAmount'
import { useAppSelector } from '@/hooks/redux'
import AddressDetailsModal from '@/modals/AddressDetailsModal'
import ModalPortal from '@/modals/ModalPortal'
import { Address } from '@/types/addresses'

interface AddressesContactsListProps {
  className?: string
  maxHeightInPx?: number
}

interface AddressListProps extends AddressesContactsListProps {
  isExpanded?: boolean
  onExpand?: () => void
  onAddressClick: () => void
}

const AddressesContactsList = ({ className, maxHeightInPx }: AddressesContactsListProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [isExpanded, setIsExpanded] = useState(false)

  const handleButtonClick = () => setIsExpanded(!isExpanded)

  const collapse = () => setIsExpanded(false)

  return (
    <FocusableContent className={className} isFocused={isExpanded} onClose={collapse}>
      <ExpandableTable isExpanded={isExpanded} maxHeightInPx={maxHeightInPx}>
        <TableHeader title={t('Your addresses')}>
          <ActionLink onClick={() => navigate('/wallet/addresses')} Icon={ChevronRight} withBackground>
            {t('See more')}
          </ActionLink>
        </TableHeader>
        <AddressesList isExpanded={isExpanded} onExpand={handleButtonClick} onAddressClick={collapse} />
      </ExpandableTable>
    </FocusableContent>
  )
}

const AddressesList = ({ className, isExpanded, onExpand, onAddressClick }: AddressListProps) => {
  const { data: addresses } = useAddressesWithSomeBalance()

  const [selectedAddress, setSelectedAddress] = useState<Address>()

  const handleRowClick = (address: Address) => {
    onAddressClick()
    setSelectedAddress(address)
  }

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {addresses.map((address) => (
          <AddressRow address={address} onClick={handleRowClick} key={address.hash}>
            <TableCellAmount>
              <AddressWorth addressHash={address.hash} />
            </TableCellAmount>
          </AddressRow>
        ))}
      </motion.div>

      {!isExpanded && addresses.length > 5 && onExpand && <ExpandRow onClick={onExpand} />}

      <ModalPortal>
        {selectedAddress && (
          <AddressDetailsModal addressHash={selectedAddress.hash} onClose={() => setSelectedAddress(undefined)} />
        )}
      </ModalPortal>
    </>
  )
}

const AddressWorth = ({ addressHash }: { addressHash: AddressHash }) => {
  const { data: addressesWorth } = useAddressesWorth([addressHash])
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)

  const balanceInFiat = addressesWorth?.[0]?.worth

  return <AmountStyled value={balanceInFiat} isFiat suffix={CURRENCIES[fiatCurrency].symbol} tabIndex={0} />
}

export default styled(AddressesContactsList)`
  margin-bottom: 45px;
`

const AmountStyled = styled(Amount)`
  flex-shrink: 0;
`
