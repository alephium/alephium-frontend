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

import { TableCell } from '@/components/Table'
import TimeSince from '@/components/TimeSince'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'
import useTransactionIconLabel from '@/features/transactionsDisplay/useTransactionIconLabel'

const TimestampCell = ({ tx, refAddressHash, isInAddressDetailsModal }: TransactionRowSectionProps) => {
  const { label } = useTransactionIconLabel(tx, refAddressHash, isInAddressDetailsModal)

  return (
    <TimestampCellStyled>
      <LabelTime>
        <DirectionLabel>{label}</DirectionLabel>

        <AssetTime>
          <TimeSince timestamp={tx.timestamp} faded />
        </AssetTime>
      </LabelTime>
    </TimestampCellStyled>
  )
}

export default TimestampCell

const TimestampCellStyled = styled(TableCell)`
  display: flex;
  text-align: left;
  gap: 20px;
`

const LabelTime = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`

const DirectionLabel = styled.span`
  color: ${({ theme }) => theme.font.primary};
  font-size: 13px;
`

const AssetTime = styled.div`
  font-size: 12px;
  max-width: 120px;
`
