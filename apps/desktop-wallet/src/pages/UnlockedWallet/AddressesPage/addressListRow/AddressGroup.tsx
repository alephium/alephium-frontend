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
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAppSelector } from '@/hooks/redux'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'

interface AddressListRowGroupProps {
  addressHash: AddressHash
}

const AddressGroup = ({ addressHash }: AddressListRowGroupProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  if (!address) return null

  return (
    <AddressListRowGroupStyled>
      {t('Group')} {address.group}
    </AddressListRowGroupStyled>
  )
}

export default AddressGroup

const AddressListRowGroupStyled = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 11px;
`
