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

import { FungibleToken, selectFungibleTokenById } from '@alephium/shared'
import styled from 'styled-components/native'

import BottomModal from '~/features/modals/BottomModal'
import withModal from '~/features/modals/withModal'
import { useAppSelector } from '~/hooks/redux'

interface TokenAmountModalProps {
  tokenId: FungibleToken['id']
}

const TokenAmountModal = withModal<TokenAmountModalProps>(({ id, tokenId }) => {
  const token = useAppSelector((state) => selectFungibleTokenById(state, tokenId))

  return (
    <BottomModal modalId={id} title={token?.name}>
      <TokenAmoutInput autoFocus placeholder={`0 ${token?.symbol}`} />
    </BottomModal>
  )
})

export default TokenAmountModal

const TokenAmoutInput = styled.TextInput`
  font-size: 42px;
  font-weight: 600;
  text-align: center;
`
