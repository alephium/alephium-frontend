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
import styled from 'styled-components/native'

import { useAppSelector } from '~/hooks/redux'
import DefaultAddressBadge from '~/images/DefaultAddressBadge'
import { selectAddressByHash } from '~/store/addressesSlice'

interface AddressColorSymbolProps {
  addressHash: AddressHash
  size?: number
}

const AddressColorSymbol = ({ addressHash, size = 10 }: AddressColorSymbolProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  if (!address) return

  return (
    <AddressColorSymbolStyled>
      {address.settings.isDefault ? (
        <DefaultAddressBadge size={size + 2} color={address.settings.color} />
      ) : (
        <Dot color={address.settings.color} size={size} />
      )}
    </AddressColorSymbolStyled>
  )
}

export default AddressColorSymbol

const AddressColorSymbolStyled = styled.View``

const Dot = styled.View<{ color?: string; size?: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`
