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
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import AddressTokensBadgesList from '@/features/assetsLists/AddressTokensBadgesList'
import { useAppSelector } from '@/hooks/redux'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'

interface SelectOptionAddressProps {
  addressHash: AddressHash
  isSelected?: boolean
  className?: string
  subtitle?: ReactNode
}

const SelectOptionAddress = ({ addressHash, isSelected, className, subtitle }: SelectOptionAddressProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  return (
    <SelectOptionItemContent
      className={className}
      displaysCheckMarkWhenSelected
      isSelected={isSelected}
      contentDirection="column"
      MainContent={
        <Header>
          <AddressBadgeContainer>
            <AddressBadgeStyled addressHash={addressHash} disableA11y truncate appendHash />
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
          </AddressBadgeContainer>
          <Group>
            {t('Group')} {address?.group}
          </Group>
        </Header>
      }
      SecondaryContent={<AddressTokensBadgesList addressHash={addressHash} withBackground showAmount />}
    />
  )
}

export default SelectOptionAddress

const Header = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
`

const Group = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-weight: 400;
  display: flex;
  flex-shrink: 0;
`

const AddressBadgeContainer = styled.div`
  flex: 1;
  min-width: 0;
  gap: 10px;
  display: flex;
  flex-direction: column;
`

const AddressBadgeStyled = styled(AddressBadge)`
  font-size: 17px;
  max-width: 70%;
`

const Subtitle = styled.div`
  font-weight: 500;
`
