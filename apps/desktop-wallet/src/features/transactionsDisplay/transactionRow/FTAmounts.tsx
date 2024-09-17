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

import Amount from '@/components/Amount'
import { TransactionRowProps } from '@/features/transactionsDisplay/transactionRow/types'
import useTransactionInfoType from '@/features/transactionsDisplay/useTransactionInfoType'
import useTransactionTokens from '@/features/transactionsDisplay/useTransactionTokens'

const FTAmounts = ({ tx, addressHash, isInAddressDetailsModal }: TransactionRowProps) => {
  const {
    data: { fungibleTokens }
  } = useTransactionTokens(tx, addressHash)
  const infoType = useTransactionInfoType(tx, addressHash, isInAddressDetailsModal)

  return fungibleTokens.map(({ id, amount }) => (
    <Amount key={id} tokenId={id} value={amount} highlight={infoType !== 'move'} showPlusMinus={infoType !== 'move'} />
  ))
}

export default FTAmounts