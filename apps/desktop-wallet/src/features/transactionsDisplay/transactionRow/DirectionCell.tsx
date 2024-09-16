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

import { ArrowLeftRight, ArrowRight as ArrowRightIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HiddenLabel from '@/components/HiddenLabel'
import { TransactionRowProps } from '@/features/transactionsDisplay/transactionRow/types'
import useTransactionDirection from '@/features/transactionsDisplay/useTransactionDirection'

const DirectionCell = ({ tx, addressHash, isInAddressDetailsModal }: TransactionRowProps) => {
  const { t } = useTranslation()
  const direction = useTransactionDirection(tx, addressHash)

  return (
    <CellDirection>
      <HiddenLabel text={direction === 'swap' ? t('and') : t('to')} />

      {isInAddressDetailsModal ? (
        <DirectionText>
          {
            {
              in: t('from'),
              out: t('to'),
              swap: t('with')
            }[direction]
          }
        </DirectionText>
      ) : direction === 'swap' ? (
        <ArrowLeftRight size={15} strokeWidth={2} />
      ) : (
        <ArrowRightIcon size={15} strokeWidth={2} />
      )}
    </CellDirection>
  )
}

export default DirectionCell

const DirectionText = styled.div`
  min-width: 50px;
  display: flex;
`

const CellDirection = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
`
