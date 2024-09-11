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

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useTransactionTokens from '@/api/apiDataHooks/useTransactionTokens'
import Amount from '@/components/Amount'
import DataList from '@/components/DataList'
import { TransactionDetailsModalSectionProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import { useTransactionInfoType } from '@/utils/transactions'

const FTsDataListRow = ({ tx, addressHash }: TransactionDetailsModalSectionProps) => {
  const {
    data: { fungibleTokens }
  } = useTransactionTokens(tx, addressHash)
  const infoType = useTransactionInfoType(tx, addressHash)
  const { t } = useTranslation()

  const isMoved = infoType === 'move'

  return (
    <DataList.Row label={t('Total value')}>
      <Amounts>
        {fungibleTokens.map(({ id, amount }) => (
          <AmountContainer key={id}>
            <Amount
              tokenId={id}
              tabIndex={0}
              value={amount}
              fullPrecision
              highlight={!isMoved}
              showPlusMinus={!isMoved}
            />
          </AmountContainer>
        ))}
      </Amounts>
    </DataList.Row>
  )
}

export default FTsDataListRow

const AmountContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

const Amounts = styled.div`
  display: flex;
  flex-direction: column;
`
