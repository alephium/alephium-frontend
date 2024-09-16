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

import Amount from '@/components/Amount'
import { TransactionRowProps } from '@/features/transactionsDisplay/transactionRow/types'
import useTransactionInfoType from '@/features/transactionsDisplay/useTransactionInfoType'
import useTransactionTokens from '@/features/transactionsDisplay/useTransactionTokens'

interface TransactionOtherTokenAmountsProps extends TransactionRowProps {
  type: 'nfts' | 'nsts'
}

const OtherAmounts = ({ tx, addressHash, isInAddressDetailsModal, type }: TransactionOtherTokenAmountsProps) => {
  const {
    data: { [type]: tokens }
  } = useTransactionTokens(tx, addressHash)
  const infoType = useTransactionInfoType(tx, addressHash, isInAddressDetailsModal)
  const { t } = useTranslation()

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

  return (
    <>
      {nbOfTokensReceived > 0 && <Amount suffix={suffix} value={nbOfTokensReceived} {...props} />}
      {nbOfTokensSent > 0 && <Amount suffix={suffix} value={-nbOfTokensSent} {...props} />}
    </>
  )
}

export default OtherAmounts
