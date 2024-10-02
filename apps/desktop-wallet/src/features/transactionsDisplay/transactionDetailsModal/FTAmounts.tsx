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

import styled from 'styled-components'

import Amount from '@/components/Amount'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import useFetchTransactionTokens from '@/features/transactionsDisplay/useFetchTransactionTokens'
import useTransactionInfoType from '@/features/transactionsDisplay/useTransactionInfoType'

const FTAmounts = ({ tx, refAddressHash }: TransactionDetailsModalTxProps) => {
  const {
    data: { fungibleTokens }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const infoType = useTransactionInfoType(tx, refAddressHash)

  const isMoved = infoType === 'move'

  return (
    <FTAmountsStyled tabIndex={0}>
      {fungibleTokens.map(({ id, amount }) => (
        <Amount key={id} tokenId={id} tabIndex={0} value={amount} highlight={!isMoved} showPlusMinus={!isMoved} />
      ))}
    </FTAmountsStyled>
  )
}

export default FTAmounts

const FTAmountsStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 26px;
  font-weight: var(--fontWeight-semiBold);
`
