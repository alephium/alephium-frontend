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

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'
import useFetchTransactionTokens from '@/features/transactionsDisplay/useFetchTransactionTokens'
import useTransactionInfoType from '@/features/transactionsDisplay/useTransactionInfoType'

interface TransactionOtherTokenAmountsProps extends TransactionRowSectionProps {
  type: 'nfts' | 'nsts'
}

const OtherAmounts = ({ tx, refAddressHash, isInAddressDetailsModal, type }: TransactionOtherTokenAmountsProps) => {
  const {
    data: { [type]: tokens }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const infoType = useTransactionInfoType(tx, refAddressHash, isInAddressDetailsModal)
  const { t } = useTranslation()
  const theme = useTheme()

  const { nbOfTokensReceived, nbOfTokensSent } = useMemo(
    () =>
      tokens.reduce(
        (acc, { amount }) => {
          if (amount > 0) {
            acc.nbOfTokensReceived += 1
          } else {
            acc.nbOfTokensSent += 1
          }

          return acc
        },
        {
          nbOfTokensReceived: 0,
          nbOfTokensSent: 0
        }
      ),
    [tokens]
  )

  const props = { highlighted: infoType !== 'move', showPlusMinus: infoType !== 'move' }
  const suffix = type === 'nfts' ? t('NFTs') : t('Unknown')

  if (nbOfTokensReceived === 0 && nbOfTokensSent === 0) return null

  return (
    <BadgeStyled
      short
      border={type === 'nfts'}
      transparent={type !== 'nfts'}
      color={
        infoType !== 'move' &&
        (nbOfTokensReceived > 0 ? theme.global.valid : nbOfTokensSent > 0 ? theme.font.highlight : undefined)
      }
    >
      {nbOfTokensReceived > 0 && <Amount suffix={suffix} value={nbOfTokensReceived} {...props} />}
      {nbOfTokensSent > 0 && <Amount suffix={suffix} value={-nbOfTokensSent} {...props} />}
    </BadgeStyled>
  )
}

export default OtherAmounts

const BadgeStyled = styled(Badge)`
  margin-top: 8px;
`
