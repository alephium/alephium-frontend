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
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import useFetchAddressWorth from '@/api/apiDataHooks/address/useFetchAddressWorth'
import ActionLink from '@/components/ActionLink'
import AddressRow from '@/components/AddressRow'
import Amount from '@/components/Amount'
import FocusableContent from '@/components/FocusableContent'
import { ExpandableTable, ExpandRow, TableHeader } from '@/components/Table'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'
import { useFetchSortedAddressesHashes } from '@/hooks/useAddresses'

interface AddressesListProps {
  className?: string
  maxHeightInPx?: number
}

interface AddressListProps extends AddressesListProps {
  onAddressClick: () => void
  isExpanded?: boolean
  onExpand?: () => void
}

const AddressesList = ({ className, maxHeightInPx }: AddressesListProps) => {
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
        <AddressesRows isExpanded={isExpanded} onExpand={handleButtonClick} onAddressClick={collapse} />
      </ExpandableTable>
    </FocusableContent>
  )
}

const AddressesRows = ({ className, isExpanded, onExpand, onAddressClick }: AddressListProps) => {
  const { data: allAddressHashes } = useFetchSortedAddressesHashes()
  const dispatch = useAppDispatch()

  const handleRowClick = (addressHash: AddressHash) => {
    onAddressClick()
    dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
  }

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {allAddressHashes.map((addressHash) => (
          <AddressRow addressHash={addressHash} onClick={handleRowClick} key={addressHash}>
            <AddressWorth addressHash={addressHash} />
          </AddressRow>
        ))}
      </motion.div>

      {!isExpanded && allAddressHashes.length > 5 && onExpand && <ExpandRow onClick={onExpand} />}
    </>
  )
}

const AddressWorth = ({ addressHash }: { addressHash: AddressHash }) => {
  const { data: totalWorth, isLoading } = useFetchAddressWorth(addressHash)

  return <AmountStyled isFiat value={totalWorth} tabIndex={0} isLoading={isLoading} loaderHeight={15.5} />
}

export default styled(AddressesList)`
  margin-bottom: 45px;
`

const AmountStyled = styled(Amount)`
  flex-shrink: 0;
`
